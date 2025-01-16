import axios from 'axios'
import { All_Friends_Failure, All_Friends_Request, All_Friends_Success, All_Users_Failure, All_Users_Request, All_Users_Success, Close_Search, Get_User_Failure, Get_User_Request, Get_User_Success, Search_Users_Failure, Search_Users_Request, Search_Users_Success, Sort_Groups } from '../actionTypes';

const API_URL = process.env.REACT_APP_SERVER_URL;

export const getAllUsers = () => async (dispatch)=>{
  dispatch({type:All_Users_Request})
  try {
    const result = await axios.get(`${API_URL}`);
    dispatch({type:All_Users_Success, payload: result.data})
  } catch (error) {
    dispatch({type:All_Users_Failure, error: error.message})
  }
}

export const getAllFriends = (user) => async (dispatch)=>{
  dispatch({type:All_Friends_Request})
  try {
    const result = await axios.post(`${API_URL}f`, {user});
    dispatch({type:All_Friends_Success, payload: result.data})
  } catch (error) {
    dispatch({type:All_Friends_Failure, error: error.message})
  }
}

export const searchUsers = (text) => async (dispatch) =>{
  dispatch({type:Search_Users_Request})
  try {
    const result = await axios.post(`${API_URL}search`,{text})
    dispatch({type:Search_Users_Success, payload: result.data})
  } catch (error) {
    dispatch({type:Search_Users_Failure, error: error.message})
  }
}

export const getSingleUser = (id) => async (dispatch) =>{
  dispatch({type: Get_User_Request})
  try {
    const result = await axios.post(`${API_URL}getUser`,{id})
    dispatch({type:Get_User_Success, payload: result.data})
  } catch (error) {
    dispatch({type:Get_User_Failure, error: error.message})
  }
}

export const closeSearch = ()=>(
  {type: Close_Search}
)

export const sortGroups = ()=>(
  {type: Sort_Groups}
)

export const getPhoto = (id) => async (dispatch)=>{
  try {
    const result = await axios.post(`${API_URL}getprofile`, {id});
    return result.data;
  } catch (error) {
    console.log(error.message)
  }
}