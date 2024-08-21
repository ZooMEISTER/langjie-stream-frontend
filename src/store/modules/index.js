import { combineReducers } from "redux";
import userLoginStateReducer from "./userLoginStateStore";
import userIdReducer from "./userIdStore";

const rootReducer = combineReducers({
    userId: userIdReducer,
    userLoginState: userLoginStateReducer,
});

export default rootReducer;