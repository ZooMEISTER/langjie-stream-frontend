import { createSlice } from '@reduxjs/toolkit'

// 用户id
const userIdSlice = createSlice({
    name: 'userId',
    initialState: {
        value: ""
    },
    reducers: {
        userId_setValue(state, action){
            state.value = action.payload
        }
    }
})

const { userId_setValue } = userIdSlice.actions
const userIdReducer = userIdSlice.reducer

export { userId_setValue }
export default userIdReducer