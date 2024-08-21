import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'antd';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import "./liveRoomPage.css"

import leftSideMenuItems from "../../constants/menuItems/leftSideMenuItems.json"

const LiveRoomPage = () => {
    const navigate = useNavigate()
    const userLoginStatus = useSelector(state => state.userLoginState.value)

    const liveRoomMenuClick = (e) => {
        switch(e.key){
            case "all-live-room":
                navigate("/all-live-room")
                break
            case "my-live-room":
                navigate("/all-live-room/mine")
                break
        }
    }

    return(
        <div style={{display: "flex", flexDirection: "row", flex: "1"}}>
            {userLoginStatus && 
            <>
                {/* 左侧菜单栏 */}
                <Menu
                    style={{
                        width: 200,
                    }}
                    onClick={liveRoomMenuClick}
                    mode="inline"
                    items={leftSideMenuItems}
                    selectable={false}
                />
                <Outlet/>
            </>
            }

            {!userLoginStatus && 
            <>
                请先登录
            </>
            }
            
        </div>
    )
}

export default LiveRoomPage