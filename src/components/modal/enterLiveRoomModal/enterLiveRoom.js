import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Button, Switch } from 'antd';

import { userRequest } from '../../../utils/request';

const EnterLiveRoomModal = ({modalOpenInfo, setModalOpenInfo, enterLiveRoom}) => {

    // 密码输入框输入的密码
    let inputPassword = useRef("")

    // 密码输入框改变
    const liveRoomPasswordInputChange = (e) => {
        inputPassword.current = e.target.value
    }

    // 取消进入直播间
    const notEnterLiveRoom = () => {
        setModalOpenInfo({open: false})
    }

    return(
        <>
            <Modal title={"进入直播间"} open={modalOpenInfo.open} footer={false} onCancel={notEnterLiveRoom}>
                <label style={{fontSize: "15px"}}>密码:</label>
                <Input style={{marginTop: "5px"}} onChange={liveRoomPasswordInputChange}/>
                <Button style={{width: "100%", marginTop: "20px"}} type="primary" onClick={() => enterLiveRoom(modalOpenInfo.live_id, inputPassword.current, modalOpenInfo.live_type)}>
                    进入
                </Button>
            </Modal>
        </>
    )
}

export default EnterLiveRoomModal