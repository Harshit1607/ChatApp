import axios from 'axios'
import { User_Login_Failure, User_Login_Request, User_Login_Success, User_Signup_Failure, User_Signup_Request, User_Signup_Success } from './actionTypes';

const API_URL = process.env.REACT_APP_SERVER_URL;

export const signup = (name, email, phone, pass) => async (dispatch) =>{
  dispatch({type: User_Signup_Request});
  try {
    const result = await axios.post(`${API_URL}user/signup`, {name, email, phone, pass});
    if(!result.data.user){
      alert(result.data.message);
      return;
    }
    dispatch({type: User_Signup_Success, payload: result.data});
  } catch (error) {
    dispatch({type: User_Signup_Failure, error: error.message});
  }
}

export const login = (phone, pass) => async (dispatch) =>{
  dispatch({type: User_Login_Request});
  try {
    const result = await axios.post(`${API_URL}user/login`, {phone, pass});
    if(!result.data.user){
      alert(result.data.message);
      return;
    }
    dispatch({type: User_Login_Success, payload: result.data});
  } catch (error) {
    dispatch({type: User_Login_Failure, error: error.message});
  }
}