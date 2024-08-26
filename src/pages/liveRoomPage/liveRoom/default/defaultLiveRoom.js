import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { message, Input, Button, Tabs, Popconfirm } from 'antd';
import Player, { Events } from 'xgplayer';
import FlvPlugin from 'xgplayer-flv'
import 'xgplayer/dist/index.min.css';
import Danmu from 'xgplayer/es/plugins/danmu'
import 'xgplayer/es/plugins/danmu/index.css'

import "./defaultLiveRoom.css"

import { userRequest } from '../../../../utils/request';
import LiveRoomRightTabItems from "../../../../constants/liveRoomRightTabItems.json"


const LiveRoom_Default = () => {
    const { TextArea } = Input;
    // 获取用户id
    const user_id = useSelector(state => state.userId.value)
    // 原页面传参，包含 user_id 和 live_id
    let [searchParams, setSearchParams] = useSearchParams()

    // 请求数，由于react在开发环境下，useEffect会执行两次，因此加入此变量保证只请求一次
    let wsRequestCount = useRef(0)
    // 当前直播间的信息
    const [currentLiveRoomInfo, setCurrentLiveRoomInfo] = useState([])

    // flvPlayer对象
    let flvPlayer = useRef(null)

    // 当前选中的Tab的key
    const [currentSelectedTabKey, setCurrentSelectedTabKey] = useState()

    // 当前直播间的观众信息
    const [currentAudienceInfo, setCurrentAudienceInfo] = useState([])

    // 当前待发送的信息
    let newMsg = useRef("")

    // 当前WebSocket连接对象
    let ws = useRef()

    useEffect(() => {
        if(wsRequestCount.current <= 0){
            // 页面加载时，向后端发送一个请求以获取直播间的详细信息
            getLiveRoomInfo()
            changeCurrentSelectedTab("chat")
            wsRequestCount.current++;
        }
    }, [])

    // 获取直播间信息
    const getLiveRoomInfo = () => {
        // console.log(searchParams.get("user_id") + " " + searchParams.get("live_id"))
        userRequest.post("/live/get-live-detail", {
            live_id: searchParams.get("live_id")
        })
        .then((response) => {
            console.log(response.data)
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
                                    borderRadius: '5px',
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
                }

                // 组装内容
                document.getElementById("live-room-chat-msg-div").appendChild(newComeMsgDiv)

                // 判断是否要自动滚动
                if(document.getElementById("live-room-chat-msg-div").scrollTop + document.getElementById("live-room-chat-msg-div").clientHeight > document.getElementById("live-room-chat-msg-div").scrollHeight - 50){
                    // 滚动条此时很靠近底部，自动滚动
                    document.getElementById("live-room-chat-msg-div").scrollTop = document.getElementById("live-room-chat-msg-div").scrollHeight
                }
                
            };
            
            ws.current.onclose = function()
            { 
                // ws连接关闭
                console.log("ws close")
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
                document.getElementById("live-room-main-chat-div").style.display = "flex"
                document.getElementById("live-room-audience-div").style.display = "none"
                break;
            case "audience":
                document.getElementById("live-room-main-chat-div").style.display = "none"
                document.getElementById("live-room-audience-div").style.display = "flex"

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
        }
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
        <div className='live-room-root-div'>
            {/* 直播页面，顶部菜单栏 */}
            <div className='live-room-top-bar'>
                {/* 该直播间的信息 */}
                <Popconfirm
                    id='live-room-info-popconfirm'
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
            <div className='live-room-main'>
                
                <div id="box-l-r">
                    <div id="left">
                        {/* 直播的视频 */}
                        <div className='live-room-main-video-div'>
                            <div id={"videoElement-" + searchParams.get("live_id")} style={{margin: "auto", height: "100%", maxWidth: "100%", maxHeight: "100%"}}>

                            </div>
                        </div>
                    </div>
                    <div id="resize-l-r" className='my-resizer' onMouseDown={leftRightOnMouseDown}></div>
                    <div id="right">
                        {/* 直播的右边栏 */}
                        <div className='live-room-right-div'>
                            <Tabs id='live-room-tab' items={LiveRoomRightTabItems} onChange={changeCurrentSelectedTab}/>

                            {/* 直播的聊天 */}
                            <div id='live-room-main-chat-div' className='live-room-main-chat-div'>
                                <div id='live-room-chat-msg-div' className='live-room-chat-msg-div'>

                                </div>
                                <div className='live-room-chat-msg-send-div'>
                                    <textarea id='new-msg-input' style={{marginBottom: "5px", height: '100px', borderColor: "#d1d1d1", fontFamily: "Microsoft Yahei", fontSize: "15px", resize: "none"}} className='input-no-border' value={newMsg.value} onChange={newMsgInputChange}></textarea >
                                    <Button type='primary' onClick={sendNewMsg}>发送</Button>
                                </div>
                            </div>
                            

                            {/* 直播的观众 */}
                            <div id='live-room-audience-div' className='live-room-audience-div'>
                                {currentAudienceInfo.map((item, index) => 
                                    <div key={item.user_id} style={{marginLeft: "5px"}}>
                                        {item.user_name}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div>
                {/* 其他信息 */}
            </div>
        </div>
    )
}

export default LiveRoom_Default