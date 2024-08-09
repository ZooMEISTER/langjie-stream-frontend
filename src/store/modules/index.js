import { combineReducers } from "redux";
import userLoginStateReducer from "./userLoginStateStore";

const rootReducer = combineReducers({
    userLoginState: userLoginStateReducer,
});

export default rootReducer;