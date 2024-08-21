import BasePage from '../pages/basePage/basePage';
import LoginPage from '../pages/loginPage/loginPage';
import RegisterPage from '../pages/registerPage/registerPage';
import FrontPage from '../pages/frontPage/frontPage';
import FirstPage from '../pages/firstPage/firstPage';
import LiveRoomPage from '../pages/liveRoomPage/liveRoomPage';
import AllLiveRoom from '../pages/liveRoomPage/allLiveRoom/allLiveRoom';
import MyLiveRoom from '../pages/liveRoomPage/myLiveRoom/myLiveRoom';

import LiveRoom from '../pages/liveRoomPage/liveRoom/liveRoom';

import { createBrowserRouter } from 'react-router-dom';

// 1.创建router实例对象，并配置路由对应关系
const router = createBrowserRouter([
    {
        path: "/",
        element: <BasePage/>,
        children: [
            {
                path: "/",
                element: <FrontPage/>,
                children: [
                    {
                        index: true,
                        element: <FirstPage/>
                    },
                    {
                        path: "/all-live-room",
                        element: <LiveRoomPage/>,
                        children: [
                            {
                                index: true,
                                element: <AllLiveRoom/>
                            },
                            {
                                path: "/all-live-room/mine",
                                element: <MyLiveRoom/>
                            }
                        ]
                    },
                    {
                        path: "/login",
                        element: <LoginPage/>
                    },
                    {
                        path: "/register",
                        element: <RegisterPage/>
                    }
                ]
            },
            {
                path: "/stream",
                element: <LiveRoom/>
            }
        ]
    },
])

export default router