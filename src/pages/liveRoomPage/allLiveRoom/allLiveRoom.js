import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button, Table, Select, Tag, message } from 'antd';
import { RedoOutlined, LockTwoTone, UnlockTwoTone, SyncOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

import "./allLiveRoom.css"

import { userRequest } from '../../../utils/request';
import NewLiveRoomModal from '../../../components/modal/newLiveRoomModal/newLiveRoom';
import EnterLiveRoomModal from '../../../components/modal/enterLiveRoomModal/enterLiveRoom';

const AllLiveRoom = () => {
    // 获取用户id
    const user_id = useSelector(state => state.userId.value)

    // 页面渲染次数
    let pageRenderTime = useRef(0)

    // 所有直播间的直播间名
    const [allLiveRoomName, setAllLiveRoomName] = useState([])
    // 所有直播间名的筛选
    let liveRoomNameFilterArray = useRef([])
    // 所有直播间创建者信息
    const [allLiveRoomCreatorInfo, setAllLiveRoomCreatorInfo] = useState([])
    // 所有直播间创建者的筛选
    let liveRoomCreatorFilterArray = useRef([])

    // 直播间表格列名
    const LiveRoomTableColumn = [
        {
            title: "直播间名",
            dataIndex: "live_name",
            key: "live_name"
        },
        {
            title: "直播间描述",
            dataIndex: "live_description",
            key: "live_description"
        },
        {
            title : "直播间创建者",
            dataIndex: "live_creator_name",
            key: "live_creator_name"
        },
        {
            title : "密码",
            dataIndex: "hasPassword",
            key: "hasPassword",
            render: (_, record) => (
                record.hasPassword ? <LockTwoTone twoToneColor="#FF0000"/> : <UnlockTwoTone twoToneColor="#00FF00"/>
            )
        },
        {
            title : "类型",
            dataIndex: "live_type",
            key: "live_type",
        },
        {
            title : "直播开始时间",
            dataIndex: "live_start_time",
            key: "live_start_time",
            sorter: (a, b) => {
                return Number(a.live_start_time) > Number(b.live_start_time)
            },
            render: (time, record) => {
                return new Date(Number(time)).toLocaleString()
            }
        },
        {
            title : "直播结束时间",
            dataIndex: "live_end_time",
            key: "live_end_time",
            sorter: (a, b) => {
                return Number(a.live_end_time) > Number(b.live_end_time)
            },
            render: (time, record) => {
                return new Date(Number(time)).toLocaleString()
            }
        },
        {
            title : "直播间创建时间",
            dataIndex: "live_create_time",
            key: "live_create_time",
            sorter: (a, b) => {
                return Number(a.live_create_time) > Number(b.live_create_time)
            },
            render: (time, record) => {
                return new Date(Number(time)).toLocaleString()
            }
        },
        {
            title : "直播间状态",
            key: "live_status",
            render: (_, record) => {
                let nowTime = new Date().getTime()
                if(nowTime < Number(record.live_start_time)){
                    // 直播未开始
                    return <Tag color="#666666"><ClockCircleOutlined/>&nbsp;&nbsp;未开始</Tag>
                }
                else if(Number(record.live_start_time) <= nowTime && nowTime <= Number(record.live_end_time)){
                    // 直播正在进行
                    return <Tag color="#2db7f5"><SyncOutlined spin/>&nbsp;&nbsp;正在进行</Tag>
                }
                else if(Number(record.live_end_time) < nowTime){
                    // 直播已结束
                    return <Tag color="#f50"><CloseCircleOutlined/>&nbsp;&nbsp;已结束</Tag>
                }
            }
        },
        {
            title : "操作",
            key: "live_room_operation",
            render: (_, record) => (
                <a onClick={() => userRequestToEnterLiveRoom(record)}>进入</a>
            )
        }
    ]

    // 直播间信息
    const [liveRoomInfo, setLiveRoomInfo] = useState([])

    // 是否打开创建新直播间的modal
    const [newLiveRoomOpen, setNewLiveRoomOpen] = useState(false)
    // 是否打开进入直播间的modal的信息
    const [enterLiveRoomOpenInfo, setEnterLiveRoomOpenInfo] = useState(false)

    useEffect(() => {
        if(pageRenderTime.current <= 0){
            // 获取所有直播间名 和 创建者
            userRequest.get("/live/get-all-live-room")
            .then((response) => {
                let _allLiveRoomName = []
                let _allLiveRoomCreatorInfo = []
                
                for(let i of response.data.liveVO_subList){
                    // 直播间名
                    _allLiveRoomName.push(
                        {
                            label: i.live_name,
                            value: i.live_id
                        }
                    )
                    // 直播间创建者
                    if(!_allLiveRoomCreatorInfo.some((value, index, arr) => {
                        if(value.label == i.live_creator_name && value.value == i.live_creator){
                            return true
                        }
                    })){
                        _allLiveRoomCreatorInfo.push({label: i.live_creator_name, value: i.live_creator})
                    }
                }
                
                setAllLiveRoomName(_allLiveRoomName)
                setAllLiveRoomCreatorInfo(_allLiveRoomCreatorInfo)
            })
            .catch((error) => {
                console.error(error)
            })

            refreshLiveRoom()

            pageRenderTime.current++
        }
    }, [])

    // 直播间名筛选改变
    const liveRoomNameFilterChange = (arr) => {
        liveRoomNameFilterArray.current = arr
        refreshLiveRoom()
    }
    // 直播间创建者筛选改变
    const liveRoomCreatorFilterChange = (arr) => {
        liveRoomCreatorFilterArray.current = arr
        refreshLiveRoom()
    }

    // 刷新所有直播间信息
    const refreshLiveRoom = () => {
        userRequest.post("/live/get-live-room",{
            nameArray: liveRoomNameFilterArray.current,
            creatorArray: liveRoomCreatorFilterArray.current
        })
        .then((response) => {
            // console.log(response.data)
            setLiveRoomInfo(response.data.liveVO_subList)
        })
        .catch((error) => {
            console.error(error)
        })
    }

    // 用户申请进入直播间
    const userRequestToEnterLiveRoom = (record) => {
        // console.log(record)
        let nowTime = new Date().getTime()
        if(Number(record.live_start_time) <= nowTime && nowTime <= Number(record.live_end_time)){
            // 直播正在进行
                if(record.hasPassword){
                // 有密码，要打开密码输入框
                setEnterLiveRoomOpenInfo({open: true, live_id: record.live_id, live_type: record.live_type})
            }
            else{
                // 无密码，直接申请进入直播
                requestToEnterLiveRoom(record.live_id, "", record.live_type)
            }
        }
        else{
            message.error("直播未开始或已结束")
        }
    }

    //发送进入直播间申请
    const requestToEnterLiveRoom = (live_id, password, live_type) => {
        userRequest.post("/live/request-to-enter-live-room", {
            live_id: live_id,
            password: password
        })
        .then((response) => {
            console.log(response.data)
            if(response.data.resultCode == 13100){
                // 可以加入直播间，跳转页面
                if(live_type == "DEFAULT") window.open("/stream/default" + "?user_id=" + user_id + "&live_id=" + live_id, "_blank", "noreferrer");
                else if(live_type == "LOTTERY") window.open("/stream/lottery" + "?user_id=" + user_id + "&live_id=" + live_id, "_blank", "noreferrer");
            }
        })
        .catch((error) => {
            console.error(error.data)
        })
    }

    return(
        <div className='all-live-room-root-div'>
            {/* 所有直播间顶部栏，包括筛选，搜索 */}
            <div className='all-live-room-top-div'>
            <label style={{alignContent: "center"}}>直播间名:&nbsp;</label>
                <Select
                    mode="tags"
                    style={{width: '20%'}}
                    placeholder="直播间名"
                    options={allLiveRoomName}
                    filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={liveRoomNameFilterChange}
                />

                <label style={{marginLeft: "20px", alignContent: "center"}}>创建者:&nbsp;</label>
                <Select
                    mode="tags"
                    style={{width: '20%'}}
                    placeholder="创建者"
                    options={allLiveRoomCreatorInfo}
                    filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={liveRoomCreatorFilterChange}
                />

                <Button type='primary' className='create-live-room-button' onClick={() => setNewLiveRoomOpen(true)}>新建</Button>
                <Button type='primary' className='refresh-live-room-button' icon={<RedoOutlined/>} onClick={() => refreshLiveRoom()}></Button>
            </div>

            {/* 显示所有直播间的列表 */}
            <div className='all-live-room-list'>
                <Table columns={LiveRoomTableColumn} dataSource={liveRoomInfo}/>
            </div>

            {/* 创建新直播间的Modal */}
            <NewLiveRoomModal
                isModalOpen={newLiveRoomOpen}
                setIsModalOpen={setNewLiveRoomOpen}
                refreshLiveRoom={refreshLiveRoom}/>
            {/* 用户申请进入直播间的modal，只在直播间有密码时弹出 */}
            <EnterLiveRoomModal
                modalOpenInfo={enterLiveRoomOpenInfo}
                setModalOpenInfo={setEnterLiveRoomOpenInfo}
                enterLiveRoom={requestToEnterLiveRoom}/>
        </div>
    )
}

export default AllLiveRoom