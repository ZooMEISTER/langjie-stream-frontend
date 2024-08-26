import { combineReducers } from "redux";
import isMobileStatusReducer from "./isMobileStatusStore";
import userLoginStateReducer from "./userLoginStateStore";
import userIdReducer from "./userIdStore";

const rootReducer = combineReducers({
    userId: userIdReducer,
    userLoginState: userLoginStateReducer,
    isMobileStatus: isMobileStatusReducer
});

export default rootReducer;