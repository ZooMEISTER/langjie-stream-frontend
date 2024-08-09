import { configureStore } from '@reduxjs/toolkit'
import userLoginStateReducer from "./modules/userLoginStateStore";

const store = configureStore({
    reducer: {
        userLoginState: userLoginStateReducer
    } 
})

export default store