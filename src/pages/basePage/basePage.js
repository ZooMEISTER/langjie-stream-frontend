import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import { useDispatch } from "react-redux";

// 导入设置是否是移动设备的reducer
import { isMobileStatus_setValue } from "../../store/modules/isMobileStatusStore";

import "./basePage.css"

const BasePage = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent);
        // console.log(isMobile); // true or false
        dispatch(isMobileStatus_setValue(isMobile))
    }, [])

    return(
        <>
            <Outlet/>
        </>
    )
}

export default BasePage