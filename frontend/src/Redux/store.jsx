import { legacy_createStore, applyMiddleware, combineReducers } from "redux";
import { thunk } from "redux-thunk";
import userReducer from "./User/userReducer";
import homeReducer from "./Home/homeReducer";
import groupReducer from "./Group/groupReducer";
import chatReducer from "./Chat/chatReducer";
import callReducer from "./Call/callReducer";
import groupcallReducer from "./GroupCall/groupcallReducer";

const rootReducer = combineReducers({
  userReducer,
  homeReducer,
  groupReducer,
  chatReducer, 
  callReducer,
  groupcallReducer,
})

const store = legacy_createStore(rootReducer, applyMiddleware(thunk));

export default store;