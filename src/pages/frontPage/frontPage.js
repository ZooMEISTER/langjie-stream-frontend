import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Menu, Modal } from 'antd';

import "./frontPage.css"

import topMenuItems_unlogin from "../../constants/menuItems/topMenuItems_unlogin.json"
import topMenuItems_logged from "../../constants/menuItems/topMenuItems_logged.json"
import { userLoginState_setValue } from '../../store/modules/userLoginStateStore';
import { Outlet } from 'react-router-dom';


const FrontPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { confirm } = Modal

    // 用户的登陆状态
    const isUserLogged = useSelector(state => state.userLoginState.value)

    // 根据用户点击跳转
    const userClickTopMenu = (e) => {
        console.log(e.key)
        switch(e.key){
            case "first-page":
                navigate("/")
                break
            case "all-live-room":
                navigate("/all-live-room")
                break
            case "login":
                navigate("/login")
                break
            case "register":
                navigate("/register")
                break
            case "logout":
                confirm({
                    title: '退出登陆',
                    icon: <ExclamationCircleFilled />,
                    content: '你确定要退出登陆吗 ?',
                    okText: "确定",
                    okType: "danger",
                    cancelText: "取消",
                    onOk() {
                        dispatch(userLoginState_setValue(false))
                        navigate("/")
                    },
                    onCancel() {},
                });
                break
                
        }
    }

    return(
        <>
            {/* 顶部菜单 */}
            <Menu selectable={false} items={isUserLogged ? topMenuItems_logged : topMenuItems_unlogin} mode="horizontal" onClick={userClickTopMenu}/>
            {/* 子路由内容占位 */}
            <div style={{flex: "1", display: "flex"}}>
                <Outlet/>
            </div>
            
        </>
    )
}

export default FrontPage