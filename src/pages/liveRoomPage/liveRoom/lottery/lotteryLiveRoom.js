import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { message, Input, Button, Tabs, Popconfirm, Table, Modal } from 'antd';
import Player, { Events } from 'xgplayer';
import FlvPlugin from 'xgplayer-flv'
import 'xgplayer/dist/index.min.css';
import Danmu from 'xgplayer/es/plugins/danmu'
import 'xgplayer/es/plugins/danmu/index.css'

import "./lotteryLiveRoom.css"

import { userRequest } from '../../../../utils/request';
import LiveRoomRightTabItems from "../../../../constants/liveRoomRightTabItems.json"
import NewPrizeModal from '../../../../components/modal/newPrizeModal/newPrize';


const LiveRoom_Lottery = () => {
    const { TextArea } = Input;
    const { confirm } = Modal;
    // 获取是否在手机上
    const isOnMobile = useSelector(state => state.isMobileStatus.value)
    // 获取用户id
    const user_id = useSelector(state => state.userId.value)
    // 原页面传参，包含 user_id 和 live_id
    let [searchParams, setSearchParams] = useSearchParams()

    // 请求数，由于react在开发环境下，useEffect会执行两次，因此加入此变量保证只请求一次
    let renderTime = useRef(0)
    // 当前直播间的信息
    const [currentLiveRoomInfo, setCurrentLiveRoomInfo] = useState([])

    // flvPlayer对象
    let flvPlayer = useRef(null)

    // 当前选中的Tab的key
    const [currentSelectedTabKey, setCurrentSelectedTabKey] = useState()

    // 当前直播间的观众信息
    const [currentAudienceInfo, setCurrentAudienceInfo] = useState([])

    // 当前直播间的奖品信息
    const [currentPrizeInfo, setCurrentPrizeInfo] = useState([])

    // 当前直播间的中奖记录信息
    const [currentWinningRecords, setCurrentWinningRecords] = useState([])

    // 当前待发送的信息
    let newMsg = useRef("")

    // 添加新奖品的弹窗
    const [isModalOpen, setIsModalOpen] = useState(false)

    // 当前WebSocket连接对象
    let ws = useRef()

    // tab
    const LiveRoomRightTabItems = [
        {
            key: "chat",
            label: "聊天"
        },
        {
            key: "audience",
            label: "观众"
        },
        {
            key: "prize",
            label: "奖品"
        },
        {
            key: "winner",
            label: "中奖名单"
        }
    ]

    // 奖品列表
    const LiveRoomPrizeTableColumn = [
        {
            title: "奖品名",
            dataIndex: "prize_name",
            key: "prize_name"
        },
        {
            title: "奖品数",
            dataIndex: "prize_count_remain",
            key: "prize_count_remain"
        },
        {
            title: "奖品等级",
            dataIndex: "prize_level",
            key: "prize_level"
        }
    ]

    // 奖品列表
    const LiveRoomPrizeTableColumn_Creator = [
        {
            title: "奖品名",
            dataIndex: "prize_name",
            key: "prize_name"
        },
        {
            title: "奖品数",
            dataIndex: "prize_count_remain",
            key: "prize_count_remain"
        },
        {
            title: "奖品等级",
            dataIndex: "prize_level",
            key: "prize_level"
        },
        {
            title : "操作",
            key: "prize_operation",
            render: (_, record) => (
                <>
                    <Popconfirm
                        icon=""
                        placement='left'
                        description={
                            <div style={{display: "flex", flexDirection: "column"}}>
                                <Button style={{width: "200px"}} type='primary' onClick={() => chooseALuckyGuy(record)}>抽奖</Button>
                                <Button style={{marginTop: "5px"}} type='primary' danger onClick={() => deletePrize(record)}>删除</Button>
                            </div>
                        }
                        showCancel={false}
                        okType=''
                        okText="关闭"
                    >
                        <a>操作</a>
                    </Popconfirm>
                </>
            )
        }
    ]

    // 中奖记录列表
    const winningRecordTableColumn = [
        {
            title: "中奖人",
            dataIndex: "user_name",
            key: "user_name"
        },
        {
            title: "中奖奖品",
            dataIndex: "prize_name",
            key: "prize_name"
        },
        {
            title: "中奖时间",
            dataIndex: "record_time",
            key: "record_time"
        }
    ]

    useEffect(() => {
        if(renderTime.current <= 0){
            // 页面加载时，向后端发送一个请求以获取直播间的详细信息
            getLiveRoomInfo()
            changeCurrentSelectedTab("chat")

            // 获取所有奖品信息
            getLiveRoomPrize()
            // 获取所有中奖记录
            getLiveRoomPrizeWinningRecords()

            renderTime.current++;
        }
    }, [])

    // 获取直播间信息
    const getLiveRoomInfo = () => {
        // console.log(searchParams.get("user_id") + " " + searchParams.get("live_id"))
        userRequest.post("/live/get-live-detail", {
            live_id: searchParams.get("live_id")
        })
        .then((response) => {
            // console.log(response.data)
            if(response.data.resultCode == 13200){
                // 成功获取直播间详细信息，把直播间信息赋给全局变量，并建立WebSocket连接
                setCurrentLiveRoomInfo(response.data.liveVO_full)
                initLiveVideo(response.data.liveVO_full.live_pull_path)
                establishWebsocketConnection("127.0.0.1", "4001", searchParams.get("live_id"), searchParams.get("user_id"))
            }
        })
        .catch((error) => {
            console.log(error)
        })
    }

    // 获取当前直播间的所有奖品
    const getLiveRoomPrize = () => {
        userRequest.post("/live/get-all-live-prize", {
            live_id: searchParams.get("live_id")
        })
        .then((response) => {
            console.log(response.data.list)
            if(response.data.resultCode == 13250){
                setCurrentPrizeInfo(response.data.list)
            }
        })
        .catch((error) => {
            console.error(error)
        })
    }

    // 获取当前直播间所有中奖记录
    const getLiveRoomPrizeWinningRecords = () => {
        userRequest.post("/live/get-prize-winner", {
            live_id: searchParams.get("live_id")
        })
        .then((response) => {
            console.log(response.data)
            if(response.data.resultCode == 13260){
                setCurrentWinningRecords(response.data.list)
            }
        })
        .catch((error) => {
            console.error(error)
        })
    }

    // 加载直播视频
    const initLiveVideo = (path) => {
        flvPlayer.current = new Player({
            id: "videoElement-" + searchParams.get("live_id"),
            url: path,
            isLive: true,
            autoplay: true,
            plugins: [FlvPlugin, Danmu],
            rotate: true,  //显示旋转按钮
            ignores: ['cssfullscreen', 'playbackrate', 'fullscreen'],

            height: "100%",
            width: "100%"
        })

        // 禁用单击视频区域暂停
        flvPlayer.current.usePluginHooks('pc', 'videoClick', (plugin, ...args) =>{
            return false
        })

        // 错误处理
        flvPlayer.current.on(Events.ERROR, (error) => {
            console.log(error)
        })
    }

    // 创建ws连接
    const establishWebsocketConnection = (ip, port, live_id, user_id) => {
        try{
            // 打开一个 web socket
            // let wsURL = "ws://" + ip + ":" + port + "/websocket/" + live_id + "/" + user_id
            let wsURL = "ws://" + ip + ":" + port + "/langjie-stream/chat?live_id=" + live_id + "&user_id=" + user_id
            console.log(wsURL)
            ws.current = new WebSocket(wsURL);
        }
        catch(err){
            message.error("Chat 连接失败: " + err)
        }

        try{
            ws.current.onopen = function()
            {
                // ws连接建立
                // console.log("ws open")
            };
            
            ws.current.onmessage = function (evt) 
            { 
                // ws连接接收信息
                let newComeMsg = JSON.parse(evt.data)
                console.log(newComeMsg)

                // 发送者的名字label
                let newComeMsgSenderNameLabel = document.createElement("label")
                // 发送的内容label
                let newComeMsgLabel = document.createElement("label")
                // 最终显示一个消息的div
                let newComeMsgDiv = document.createElement("div")

                switch(newComeMsg.msgType){
                    case "USER_MESSAGE":
                    case "USER_MESSAGE_HISTORY":
                        // 获取消息的时间对象
                        let msgTime = new Date()
                        msgTime.setTime(newComeMsg.sendTime)
                        // 是用户发送的普通消息
                        if(newComeMsg.senderId == user_id){
                            // 是用户自己发送的信息
                            newComeMsgSenderNameLabel.style.color = "green"
                        }
                        else{
                            // 是别的用户发送的信息
                            newComeMsgSenderNameLabel.style.color = "blue"
                        }
                        // 发送者名称
                        newComeMsgSenderNameLabel.style.whiteSpace = "no-wrap"
                        newComeMsgSenderNameLabel.innerHTML = newComeMsg.senderName + ":&nbsp;"
                        // 发送的信息
                        newComeMsgLabel.style.whiteSpace = "pre-wrap"
                        newComeMsgLabel.style.wordBreak = "break-all"
                        newComeMsgLabel.title = msgTime.toLocaleString()
                        newComeMsgLabel.innerHTML = newComeMsg.msg
                        // 包含整个信息的div
                        newComeMsgDiv.style.display = "flex"
                        newComeMsgDiv.style.flexDirection = "row"
                        newComeMsgDiv.style.width = "95%"
                        newComeMsgDiv.style.marginLeft = "auto"
                        newComeMsgDiv.style.marginRight = "auto"
                        newComeMsgDiv.style.marginBottom = "5px"
                        // 组装
                        newComeMsgDiv.appendChild(newComeMsgSenderNameLabel)
                        newComeMsgDiv.appendChild(newComeMsgLabel)

                        // 如果是用户实时消息，则发送弹幕
                        if(newComeMsg.msgType == "USER_MESSAGE"){
                            // 设置弹幕格式并发送弹幕
                            flvPlayer.current.danmu.setFontSize(25, 50)
                            flvPlayer.current.danmu.sendComment({
                                duration: 10000,         // 弹幕持续显示时间,毫秒(最低为5000毫秒)
                                id: newComeMsg.msgId,   // 弹幕id，需唯一
                                txt: newComeMsg.msg,    // 弹幕内容
                                style: {                // 弹幕自定义样式
                                    color: 'white',
                                    borderRadius: '2px',
                                    padding: '5px',
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)'
                                },
                            })
                        }
                        
                        break;
                    case "SERVER_INFO_CONNECT_DISCONNECT":
                    case "SERVER_INFO_USER_IN_OUT":
                        // 是服务器发送的信息
                        // 发送的信息
                        newComeMsgLabel.style.whiteSpace = "pre-wrap"
                        newComeMsgLabel.style.wordBreak = "break-all"
                        newComeMsgLabel.style.margin = "auto"
                        newComeMsgLabel.style.fontSize = "12px"
                        newComeMsgLabel.style.color = "grey"
                        newComeMsgLabel.innerHTML = newComeMsg.msg
                        // 包含整个信息的div
                        newComeMsgDiv.style.display = "flex"
                        newComeMsgDiv.style.flexDirection = "row"
                        newComeMsgDiv.style.width = "95%"
                        newComeMsgDiv.style.height = "25px"
                        newComeMsgDiv.style.marginLeft = "auto"
                        newComeMsgDiv.style.marginRight = "auto"
                        // 组装
                        newComeMsgDiv.appendChild(newComeMsgLabel)

                        break;
                    case "SERVER_ERROR":
                        // 是服务器发送的错误信息
                        // 发送的信息
                        newComeMsgLabel.style.whiteSpace = "pre-wrap"
                        newComeMsgLabel.style.wordBreak = "break-all"
                        newComeMsgLabel.style.margin = "auto"
                        newComeMsgLabel.style.fontSize = "12px"
                        newComeMsgLabel.style.color = "red"
                        newComeMsgLabel.innerHTML = newComeMsg.msg
                        // 包含整个信息的div
                        newComeMsgDiv.style.display = "flex"
                        newComeMsgDiv.style.flexDirection = "row"
                        newComeMsgDiv.style.width = "95%"
                        newComeMsgDiv.style.height = "25px"
                        newComeMsgDiv.style.marginLeft = "auto"
                        newComeMsgDiv.style.marginRight = "auto"
                        // 组装
                        newComeMsgDiv.appendChild(newComeMsgLabel)

                        break;
                    case "USER_WIN_PRIZE":
                    case "USER_WIN_PRIZE_HISTORY":
                        // 是用户的中奖信息
                        // 发送的信息
                        newComeMsgLabel.style.whiteSpace = "pre-wrap"
                        newComeMsgLabel.style.wordBreak = "break-all"
                        newComeMsgLabel.style.margin = "auto"
                        newComeMsgLabel.style.fontSize = "15px"
                        newComeMsgLabel.style.color = "red"
                        newComeMsgLabel.innerHTML = newComeMsg.msg
                        // 包含整个信息的div
                        newComeMsgDiv.style.display = "flex"
                        newComeMsgDiv.style.flexDirection = "row"
                        newComeMsgDiv.style.width = "95%"
                        newComeMsgDiv.style.height = "25px"
                        newComeMsgDiv.style.marginLeft = "auto"
                        newComeMsgDiv.style.marginRight = "auto"
                        newComeMsgDiv.style.backgroundColor = "yellow"
                        // 组装
                        newComeMsgDiv.appendChild(newComeMsgLabel)

                        if(newComeMsg.msgType == "USER_WIN_PRIZE"){
                            // 发送弹幕
                            // 设置弹幕格式并发送弹幕
                            flvPlayer.current.danmu.setFontSize(30, 60)
                            flvPlayer.current.danmu.sendComment({
                                duration: 10000,         // 弹幕持续显示时间,毫秒(最低为5000毫秒)
                                id: newComeMsg.msgId,   // 弹幕id，需唯一
                                txt: newComeMsg.msg,    // 弹幕内容
                                style: {                // 弹幕自定义样式
                                    color: 'rgba(255, 72, 72, 1)',
                                    borderRadius: '2px',
                                    padding: '5px',
                                    backgroundColor: 'rgba(255, 255, 0, 0.3)'
                                },
                            })

                            // 在画面上放一层中奖提示
                            // 获取视频的dom元素
                            let videoDivDOM = document.getElementById("lottery-live-room-main-video-div")
                            if(videoDivDOM != undefined){
                                let winningPrizePop = document.createElement("div")
                                winningPrizePop.innerHTML = newComeMsg.msg
                                winningPrizePop.id = "win-prize-pop" + newComeMsg.msgId
                                winningPrizePop.style.position = "absolute"
                                winningPrizePop.style.left = "20px"
                                winningPrizePop.style.bottom = "20px"
                                winningPrizePop.style.height = "200px"
                                winningPrizePop.style.width = "400px"
                                winningPrizePop.style.fontSize = "50px"
                                winningPrizePop.style.alignContent = "center"
                                winningPrizePop.style.backgroundColor = "rgba(255, 255, 0, 0.0)"
                                winningPrizePop.style.color = "red"
                                winningPrizePop.style.zIndex = "10"

                                // 组装
                                videoDivDOM.appendChild(winningPrizePop)

                                // 延时销毁中奖提示
                                setTimeout(() => {
                                    document.getElementById("win-prize-pop" + newComeMsg.msgId).remove()
                                }, 5000)
                            }

                            // 更新奖品和中奖记录
                            getLiveRoomPrize()
                            getLiveRoomPrizeWinningRecords()
                        }
                        
                        break;
                    case "YOU_ARE_THE_WINNER":
                        // 已登录用户为中奖者
                        Modal.success({
                            content: newComeMsg.msg,
                        });
                        break;
                }

                newComeMsgDiv.style.marginTop = "5px"
                // 组装内容
                document.getElementById("lottery-live-room-chat-msg-div").appendChild(newComeMsgDiv)

                // 判断是否要自动滚动
                if(document.getElementById("lottery-live-room-chat-msg-div").scrollTop + document.getElementById("lottery-live-room-chat-msg-div").clientHeight > document.getElementById("lottery-live-room-chat-msg-div").scrollHeight - 50){
                    // 滚动条此时很靠近底部，自动滚动
                    document.getElementById("lottery-live-room-chat-msg-div").scrollTop = document.getElementById("lottery-live-room-chat-msg-div").scrollHeight
                }
                
            };
            
            ws.current.onclose = function()
            { 
                // ws连接关闭
                console.log("ws close")

                // 发送的内容label
                let newComeMsgLabel = document.createElement("label")
                // 最终显示一个消息的div
                let newComeMsgDiv = document.createElement("div")

                newComeMsgLabel.style.whiteSpace = "pre-wrap"
                newComeMsgLabel.style.wordBreak = "break-all"
                newComeMsgLabel.style.margin = "auto"
                newComeMsgLabel.style.fontSize = "12px"
                newComeMsgLabel.style.color = "red"
                newComeMsgLabel.innerHTML = "CHAT已断开"
                // 包含整个信息的div
                newComeMsgDiv.style.display = "flex"
                newComeMsgDiv.style.flexDirection = "row"
                newComeMsgDiv.style.width = "95%"
                newComeMsgDiv.style.height = "25px"
                newComeMsgDiv.style.marginLeft = "auto"
                newComeMsgDiv.style.marginRight = "auto"
                // 组装
                newComeMsgDiv.appendChild(newComeMsgLabel)
                document.getElementById("lottery-live-room-chat-msg-div").appendChild(newComeMsgDiv)
            };
        }
        catch(err){
            message.error(err)
        } 
    }

    // 新信息输入框
    const newMsgInputChange = (e) => {
        newMsg.current = e.target.value
        // console.log(newMsg.current)
    }

    // 发送新消息
    const sendNewMsg = () => {
        ws.current.send(newMsg.current)
        newMsg.current = ""
        document.getElementById("new-msg-input").value = ""
    }

    // 更改当前选中的选项卡
    const changeCurrentSelectedTab = (key) => {
        setCurrentSelectedTabKey(key)
        switch(key){
            case "chat":
                document.getElementById("lottery-live-room-main-chat-div").style.display = "flex"
                document.getElementById("lottery-live-room-audience-div").style.display = "none"
                document.getElementById("lottery-live-room-prize-div").style.display = "none"
                document.getElementById("lottery-live-room-winner-div").style.display = "none"
                break;
            case "audience":
                document.getElementById("lottery-live-room-main-chat-div").style.display = "none"
                document.getElementById("lottery-live-room-audience-div").style.display = "flex"
                document.getElementById("lottery-live-room-prize-div").style.display = "none"
                document.getElementById("lottery-live-room-winner-div").style.display = "none"

                // 获取观众列表
                userRequest.post("/live/get-audience-list", {
                    live_id: currentLiveRoomInfo.live_id
                })
                .then((response) => {
                    console.log(response.data)
                    setCurrentAudienceInfo(response.data.userVOList)
                })
                .catch((error) => {
                    console.error(error)
                })
                break;
            case "prize":
                document.getElementById("lottery-live-room-main-chat-div").style.display = "none"
                document.getElementById("lottery-live-room-audience-div").style.display = "none"
                document.getElementById("lottery-live-room-prize-div").style.display = "flex"
                document.getElementById("lottery-live-room-winner-div").style.display = "none"
                break;
            case "winner":
                document.getElementById("lottery-live-room-main-chat-div").style.display = "none"
                document.getElementById("lottery-live-room-audience-div").style.display = "none"
                document.getElementById("lottery-live-room-prize-div").style.display = "none"
                document.getElementById("lottery-live-room-winner-div").style.display = "flex"
                break;
        }
    }

    // 抽奖
    const chooseALuckyGuy = (record) => {
        confirm({
            title: '抽奖？',
            icon: "",
            content: '此操作不可逆',
            okText: "确认",
            okType: "danger",
            cancelText: "取消",
            onOk() {
                // 用户确认抽奖
                // 发送请求
                userRequest.post("/live/draw", {
                    prize_id: record.prize_id,
                })
                .then((response) => {
                    console.log(response.data)
                    if(response.data.resultCode == 13244){
                        message.success(response.data.msg)
                        getLiveRoomPrize()
                        getLiveRoomPrizeWinningRecords()
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    }

    // 删除奖品
    const deletePrize = (record) => {
        confirm({
            title: '你确定要删除该奖品吗？',
            icon: "",
            content: '此操作不可逆',
            okText: "确认",
            okType: "danger",
            cancelText: "取消",
            onOk() {
                // 用户确认删除该奖品
                userRequest.post("/live/delete-prize", {
                    prize_id: record.prize_id
                })
                .then((response) => {
                    if(response.data.resultCode == 13242){
                        message.success(response.data.msg)
                        getLiveRoomPrize()
                        getLiveRoomPrizeWinningRecords()
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    }

    // 左右可调布局大小调整
    const leftRightOnMouseDown = (e) => {
        let box = document.getElementById("box-l-r");
        let resize = document.getElementById("resize-l-r");
        let left = document.getElementById("left");
        let right = document.getElementById("right");

        box.style.maxWidth = box.offsetWidth
        
        let startX = e.clientX;
        resize.left = resize.offsetLeft;
        document.onmousemove = function (e) {
            let endX = e.clientX;

            let moveLen = resize.left + (endX - startX);
            if(moveLen - box.offsetLeft < 100) moveLen = box.offsetLeft + 100
            if(box.offsetLeft + box.clientWidth - moveLen < 100) moveLen = box.offsetLeft + box.clientWidth + 100
            if (moveLen > box.clientWidth - resize.offsetWidth - 100) moveLen = box.clientWidth - resize.offsetWidth - 100;

            resize.style.left = moveLen - box.offsetLeft;
            left.style.width = moveLen - box.offsetLeft + "px";
            right.style.width = (box.clientWidth - moveLen + box.offsetLeft - 5) + "px";
        }
        document.onmouseup = function (evt) {
            document.onmousemove = null;
            document.onmouseup = null;
            resize.releaseCapture && resize.releaseCapture();
        }
        resize.setCapture && resize.setCapture();
        return false;
    }

    return(
        <div className='lottery-live-room-root-div'>
            {/* 在电脑上显示 */}
            {!isOnMobile && 
            <>
                {/* 直播页面，顶部菜单栏 */}
                <div className='lottery-live-room-top-bar'>
                    {/* 该直播间的信息 */}
                    <Popconfirm
                        id='lottery-live-room-info-popconfirm'
                        placement="bottomRight"
                        icon=""
                        title="直播间信息"
                        description={
                            <div style={{display: "flex", flexDirection: "column"}}>
                                <div style={{display: "flex", flexDirection: "row"}}>
                                    <label style={{whiteSpace: "nowrap"}}>直播间名:&nbsp;</label>
                                    <label>{currentLiveRoomInfo.live_name}</label>
                                </div>
                                <div style={{display: "flex", flexDirection: "row"}}>
                                    <label style={{whiteSpace: "nowrap"}}>直播描述:&nbsp;</label>
                                    <label>{currentLiveRoomInfo.live_description}</label>
                                </div>
                                <div style={{display: "flex", flexDirection: "row"}}>
                                    <label style={{whiteSpace: "nowrap"}}>拉流路径:&nbsp;</label>
                                    <label style={{maxWidth: "300px", whiteSpace: "pre-wrap", wordWrap: "break-word"}}>{currentLiveRoomInfo.live_pull_path}</label>
                                </div>
                                {user_id == currentLiveRoomInfo.live_creator && 
                                    <div style={{display: "flex", flexDirection: "row"}}>
                                        <label style={{whiteSpace: "nowrap"}}>推流路径:&nbsp;</label>
                                        <label style={{maxWidth: "300px", whiteSpace: "pre-wrap", wordWrap: "break-word"}}>{currentLiveRoomInfo.live_push_path}</label>
                                    </div>
                                }
                            </div>
                        }
                        showCancel={false}
                        okText="好的"
                    >
                        <Button style={{margin: "auto", marginRight: "10px"}}>直播间信息</Button>
                    </Popconfirm>
                </div>

                {/* 直播的下半部分，包括视频和聊天 */}
                <div className='lottery-live-room-main'>
                    
                    <div id="box-l-r">
                        <div id="left">
                            {/* 直播的视频 */}
                            <div id='lottery-live-room-main-video-div' className='lottery-live-room-main-video-div'>
                                <div id={"videoElement-" + searchParams.get("live_id")} style={{margin: "auto", height: "100%", maxWidth: "100%", maxHeight: "100%"}}>

                                </div>
                            </div>
                        </div>
                        <div id="resize-l-r" className='my-resizer' onMouseDown={leftRightOnMouseDown}></div>
                        <div id="right">
                            {/* 直播的右边栏 */}
                            <div className='lottery-live-room-right-div'>
                                <Tabs id='lottery-live-room-tab' items={LiveRoomRightTabItems} onChange={changeCurrentSelectedTab}/>

                                {/* 直播的聊天 */}
                                <div id='lottery-live-room-main-chat-div' className='lottery-live-room-main-chat-div'>
                                    <div id='lottery-live-room-chat-msg-div' className='lottery-live-room-chat-msg-div'>

                                    </div>
                                    <div className='lottery-live-room-chat-msg-send-div'>
                                        <textarea id='new-msg-input' style={{marginBottom: "5px", height: '100px', borderColor: "#d1d1d1", fontFamily: "Microsoft Yahei", fontSize: "15px", resize: "none"}} className='input-no-border' value={newMsg.value} onChange={newMsgInputChange}></textarea >
                                        <Button type='primary' onClick={sendNewMsg}>发送</Button>
                                    </div>
                                </div>
                                

                                {/* 直播的观众 */}
                                <div id='lottery-live-room-audience-div' className='lottery-live-room-audience-div'>
                                    {currentAudienceInfo.map((item, index) => 
                                        <div key={item.user_id} style={{marginLeft: "5px"}}>
                                            {item.user_name}
                                        </div>
                                    )}
                                </div>

                                {/* 直播的奖品 */}
                                <div id='lottery-live-room-prize-div' className='lottery-live-room-prize-div'>
                                    {/* 根据情况决定是否显示添加奖品的按钮 */}
                                    {currentLiveRoomInfo.live_creator == user_id && 
                                        <Button type='primary' onClick={() => setIsModalOpen(true)}>添加奖品</Button>
                                    }

                                    <Table
                                        columns={
                                            user_id == currentLiveRoomInfo.live_creator ? 
                                            LiveRoomPrizeTableColumn_Creator :
                                            LiveRoomPrizeTableColumn
                                        }
                                        dataSource={currentPrizeInfo}
                                        rowKey={record => record.prize_id}
                                    />
                                </div>

                                {/* 直播的中奖者 */}
                                <div id='lottery-live-room-winner-div' className='lottery-live-room-winner-div'>
                                    <Table
                                        columns={winningRecordTableColumn}
                                        dataSource={currentWinningRecords}
                                        rowKey={record => record.winning_record_id}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div>
                    {/* 其他信息 */}
                </div>
            </>
            }
            
            {/* 在手机上显示 */}
            {isOnMobile && 
            <>

            </>
            }


            {/* 添加新奖品的弹窗 */}
            <NewPrizeModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                live_id={searchParams.get("live_id")}
                getLiveRoomPrize={getLiveRoomPrize}/>
        </div>
    )
}

export default LiveRoom_Lottery