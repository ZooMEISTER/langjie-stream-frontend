import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Menu, Modal } from 'antd';

import "./frontPage.css"

import topMenuItems_unlogin from "../../constants/menuItems/topMenuItems_unlogin.json"
import topMenuItems_logged from "../../constants/menuItems/topMenuItems_logged.json"
import { userLoginState_setValue } from '../../store/modules/userLoginStateStore';
import { userId_setValue } from '../../store/modules/userIdStore';
import { Outlet } from 'react-router-dom';
import { userRequest } from '../../utils/request';


const FrontPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { confirm } = Modal

    // 用户的登陆状态
    const isUserLogged = useSelector(state => state.userLoginState.value)
    // 用户的id
    const user_id = useSelector(state => state.userId.value)

    // 渲染次数，用来规避开发环境下渲染两次的问题
    let renderTime = useRef(0);

    // 当用户登陆状态变化时，渲染用户名
    useEffect(() => {
        renderUserName()
    }, [isUserLogged])

    // 渲染用户名
    const renderUserName = () => {
        if(isUserLogged){
            // 如果是第一次渲染且用户已登录
            if(renderTime.current == 0 && isUserLogged){
                // 获取自己的用户信息
                userRequest.post("/user/user-get-user-info", {
                    user_id: user_id
                })
                .then((response) => {
                    let userNameLabel = document.createElement("li")
                    userNameLabel.style.order = "10"
                    userNameLabel.id = "user-name-label"
                    userNameLabel.style.marginRight = "20px"
                    userNameLabel.innerHTML = response.data.userVO.user_name
                    document.getElementById("top-menu").appendChild(userNameLabel)
                })
                .catch((error) => {
                    console.error(error)
                })

                renderTime.current++;
            }
        }
        else{
            renderTime.current = 0
            if(document.getElementById("user-name-label") != undefined) document.getElementById("user-name-label").remove()
        }
    }

    // 根据用户点击跳转
    const userClickTopMenu = (e) => {
        // console.log(e.key)
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
                        dispatch(userId_setValue(""))
                        localStorage.removeItem("langjie-stream-login-token")
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
            <Menu id='top-menu' selectable={false} items={isUserLogged ? topMenuItems_logged : topMenuItems_unlogin} mode="horizontal" onClick={userClickTopMenu}></Menu>
            {/* 子路由内容占位 */}
            <div style={{flex: "1", display: "flex"}}>
                <Outlet/>
            </div>
            
        </>
    )
}

export default FrontPage