import { legacy_createStore, applyMiddleware, combineReducers } from "redux";
import { thunk } from "redux-thunk";
import userReducer from "./User/userReducer";
import homeReducer from "./Home/homeReducer";
import groupReducer from "./Group/groupReducer";
import chatReducer from "./Chat/chatReducer";

const rootReducer = combineReducers({
  userReducer,
  homeReducer,
  groupReducer,
  chatReducer
})

const store = legacy_createStore(rootReducer, applyMiddleware(thunk));

export default store;