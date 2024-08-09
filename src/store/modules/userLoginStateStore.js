import { createSlice } from '@reduxjs/toolkit'

// 用户是否登录
const userLoginStateSlice = createSlice({
    name: 'userLoginState',
    initialState: {
        value: false
    },
    reducers: {
        userLoginState_setValue(state, action){
            state.value = action.payload
        }
    }
})

const { userLoginState_setValue } = userLoginStateSlice.actions
const userLoginStateReducer = userLoginStateSlice.reducer

export { userLoginState_setValue }
export default userLoginStateReducer