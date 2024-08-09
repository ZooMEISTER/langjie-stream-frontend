import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { Menu } from 'antd';

import "./frontPage.css"

import topMenuItems_unlogin from "../../constants/menuItems/topMenuItems_unlogin.json"
import topMenuItems_logged from "../../constants/menuItems/topMenuItems_logged.json"
import { Outlet } from 'react-router-dom';


const FrontPage = () => {
    const navigate = useNavigate()

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
        }
    }

    return(
        <>
            {/* 顶部菜单 */}
            <Menu selectable={false} items={isUserLogged ? topMenuItems_logged : topMenuItems_unlogin} mode="horizontal" onClick={userClickTopMenu}/>
            {/* 子路由内容占位 */}
            <Outlet/>
        </>
    )
}

export default FrontPage