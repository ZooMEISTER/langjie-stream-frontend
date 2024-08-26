import { createSlice } from '@reduxjs/toolkit'

const isMobileStatusSlice = createSlice({
    name: 'isMobileStatus',
    initialState: {
        value: false
    },
    reducers: {
        isMobileStatus_setValue(state, action){
            state.value = action.payload
        }
    }
})

const { isMobileStatus_setValue } = isMobileStatusSlice.actions
const isMobileStatusReducer = isMobileStatusSlice.reducer

export { isMobileStatus_setValue }
export default isMobileStatusReducer