import BasePage from '../pages/basePage/basePage';
import LoginPage from '../pages/loginPage/loginPage';
import RegisterPage from '../pages/registerPage/registerPage';
import FrontPage from '../pages/frontPage/frontPage';
import FirstPage from '../pages/firstPage/firstPage';
import AllLiveRoomPage from '../pages/allLiveRoomPage/allLiveRoomPage';

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
                        element: <AllLiveRoomPage/>
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
        ]
    },
])

export default router