import { legacy_createStore, applyMiddleware, combineReducers } from "redux";
import { thunk } from "redux-thunk";
import userReducer from "./User/userReducer";
import homeReducer from "./Home/homeReducer";

const rootReducer = combineReducers({
  userReducer,
  homeReducer
})

const store = legacy_createStore(rootReducer, applyMiddleware(thunk));

export default store;