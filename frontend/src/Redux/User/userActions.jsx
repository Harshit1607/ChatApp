import axios from 'axios'
import { Change_Photo_Failure, Change_Photo_Request, Change_Photo_Success, Delete_Photo_Failure, Delete_Photo_Request, Delete_Photo_Success, Logout, Set_AboutMe_Failure, Set_AboutMe_Request, Set_AboutMe_Success, User_Login_Failure, User_Login_Request, User_Login_Success, User_Signup_Failure, User_Signup_Request, User_Signup_Success } from '../actionTypes';

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

export const changePhoto = (image, user) => async (dispatch) =>{
  dispatch({type: Change_Photo_Request});
  try {
    const result = await axios.post(`${API_URL}user/profile`, {image, user});
    
    dispatch({type: Change_Photo_Success, payload: result.data});
  } catch (error) {
    dispatch({type: Change_Photo_Failure, error: error.message});
  }
}

export const deletePhoto = (user) => async (dispatch) =>{
  dispatch({type: Delete_Photo_Request});
  try {
    const result = await axios.post(`${API_URL}user/deleteprofile`, {user});
    
    dispatch({type: Delete_Photo_Success, payload: result.data});
  } catch (error) {
    dispatch({type: Delete_Photo_Failure, error: error.message});
  }
}

export const logout = ()=>{
  return({type: Logout})
}

export const newAboutme = (user, text)=> async (dispatch)=>{
  dispatch({type: Set_AboutMe_Request})
  try {
    const result = await axios.post(`${API_URL}user/about`, {user, text});
    dispatch({type: Set_AboutMe_Success, payload: result.data})
  } catch (error) {
    dispatch({type: Set_AboutMe_Failure, error: error.message})
  }
}