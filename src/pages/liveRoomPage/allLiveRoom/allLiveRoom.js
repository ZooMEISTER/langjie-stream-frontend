import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button, Table, Space } from 'antd';
import { RedoOutlined } from '@ant-design/icons';

import "./allLiveRoom.css"

import { userRequest } from '../../../utils/request';
import LiveRoomTableColumn from "../../../constants/allLiveRoomTableColumn.json"
import NewLiveRoomModal from '../../../components/modal/newLiveRoomModal/newLiveRoom';
import EnterLiveRoomModal from '../../../components/modal/enterLiveRoomModal/enterLiveRoom';

const AllLiveRoom = () => {
    // 获取用户id
    const user_id = useSelector(state => state.userId.value)

    // 直播间信息
    const [liveRoomInfo, setLiveRoomInfo] = useState([])

    // 是否打开创建新直播间的modal
    const [newLiveRoomOpen, setNewLiveRoomOpen] = useState(false)
    // 是否打开进入直播间的modal的信息
    const [enterLiveRoomOpenInfo, setEnterLiveRoomOpenInfo] = useState(false)

    useEffect(() => {
        // 添加是否有密码的渲染
        for(let i = 0; i < LiveRoomTableColumn.length; i++){
            if(LiveRoomTableColumn[i].key == "hasPassword"){
                LiveRoomTableColumn[i].render = (_, record) => (
                    record.hasPassword ? "是" : "否"
                )
            }
        }
        // 添加直播间Action的渲染
        LiveRoomTableColumn[LiveRoomTableColumn.length - 1].render = (_, record) => (
            <a onClick={() => userRequestToEnterLiveRoom(record)}>进入</a>
        )
    }, [])

    // 刷新直播间信息
    const refreshLiveRoom = () => {
        userRequest.post("/live/get-live-room",{

        })
        .then((response) => {
            setLiveRoomInfo(response.data)
        })
        .catch((error) => {
            console.error(error)
        })
    }

    // 用户申请进入直播间
    const userRequestToEnterLiveRoom = (record) => {
        // console.log(record)
        if(record.hasPassword){
            // 有密码，要打开密码输入框
            setEnterLiveRoomOpenInfo({open: true, live_id: record.live_id})
        }
        else{
            // 无密码，直接申请进入直播
            requestToEnterLiveRoom(record.live_id, "")
        }
    }

    // 确定要进入直播间
    const enterLiveRoom = (live_id, inputPassword) => {
        // console.log(live_id + ": " + inputPassword)
        requestToEnterLiveRoom(live_id, inputPassword)
    }

    //发送进入直播间申请
    const requestToEnterLiveRoom = (live_id, password) => {
        userRequest.post("/live/request-to-enter-live-room", {
            live_id: live_id,
            password: password
        })
        .then((response) => {
            console.log(response.data)
            if(response.data.resultCode == 13100){
                // 可以加入直播间，跳转页面
                window.open("/stream" + "?user_id=" + user_id + "&live_id=" + live_id, "_blank", "noreferrer");
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
                setIsModalOpen={setNewLiveRoomOpen}/>
            {/* 用户申请进入直播间的modal，只在直播间有密码时弹出 */}
            <EnterLiveRoomModal
                modalOpenInfo={enterLiveRoomOpenInfo}
                setModalOpenInfo={setEnterLiveRoomOpenInfo}
                enterLiveRoom={enterLiveRoom}/>
        </div>
    )
}

export default AllLiveRoom