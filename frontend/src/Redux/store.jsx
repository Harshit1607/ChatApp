import { legacy_createStore, applyMiddleware, combineReducers } from "redux";
import { thunk } from "redux-thunk";
import userReducer from "./userReducer";

const rootReducer = combineReducers({
  userReducer
})

const store = legacy_createStore(rootReducer, applyMiddleware(thunk));

export default store;