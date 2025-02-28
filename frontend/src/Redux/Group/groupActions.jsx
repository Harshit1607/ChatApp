import axios from 'axios'
import { Change_GroupPhoto_Failure, Change_GroupPhoto_Request, Change_GroupPhoto_Success, Close_Chat, Close_Group, Create_Group_Failure, Create_Group_Request, Create_Group_Success, Leave_Group_Failure, Leave_Group_Request, Leave_Group_Success, Make_Admin_Failure, Make_Admin_Request, Make_Admin_Success, Make_Group, Open_Group_Failure, Open_Group_Request, Open_Group_Success, Set_Description_Failure, Set_Description_Request, Set_Description_Success } from '../actionTypes';
import { joinGroup } from '../../Socket/GroupSocket';

const API_URL = process.env.REACT_APP_SERVER_URL;

export const openGroup = (user, other, group=null) => async (dispatch) =>{
  dispatch({type: Open_Group_Request})

  try {
    // Now handle the group opening via API
    const result = await axios.post(`${API_URL}group/open`, { user, other, group });
    joinGroup({user: user._id, group: result.data.groupChat._id});
    // Dispatch the success action with the group data
    dispatch({ type: Open_Group_Success, payload: result.data });
  } catch (error) {
    // In case of an error, dispatch failure and handle it
    dispatch({ type: Open_Group_Failure, error: error.message });
  }
};


export const makeGroup = ()=>(
  {type: Make_Group}
)

export const closeGroup = ()=>(
  {type: Close_Group}
)

export const createGroup = (name, user, others) => async (dispatch) =>{
  dispatch({type: Create_Group_Request})
  
  try {
    const result = await axios.post(`${API_URL}group/create`,{name, user, others});
    dispatch({type: Create_Group_Success, payload: result.data})
  } catch (error) {
    dispatch({type: Create_Group_Failure, error: error.message})
  }
}

export const closeChat = ()=>(
  {type: Close_Chat}
)

export const changeGroupPhoto = (image, group)=> async (dispatch)=>{
  dispatch({type: Change_GroupPhoto_Request});
  try {
    const result = await axios.post(`${API_URL}group/profile`, {image, group});
    
    dispatch({type: Change_GroupPhoto_Success, payload: result.data});
  } catch (error) {
    dispatch({type: Change_GroupPhoto_Failure, error: error.message});
  }
}

export const deleteGroupPhoto = (group)=> async (dispatch)=>{
  dispatch({type: Change_GroupPhoto_Request});
  try {
    const result = await axios.post(`${API_URL}group/deleteprofile`, {group});
    
    dispatch({type: Change_GroupPhoto_Success, payload: result.data});
  } catch (error) {
    dispatch({type: Change_GroupPhoto_Failure, error: error.message});
  }
}

export const leaveGroup = (user, group, newUser=null) => async (dispatch) =>{
  dispatch({type: Leave_Group_Request})
  try {
    const result = await axios.post(`${API_URL}group/leave`,{user, group, newUser});
    dispatch({type: Leave_Group_Success, payload: result.data})
  } catch (error) {
    dispatch({type: Leave_Group_Failure, error: error.message})
  }
}

export const makeAdmin = (user, group, newUser) => async (dispatch) =>{
  dispatch({type: Make_Admin_Request})
  
  try {
    const result = await axios.post(`${API_URL}group/admin`,{user, group, newUser});
    dispatch({type: Make_Admin_Success, payload: result.data})
  } catch (error) {
    dispatch({type: Make_Admin_Failure, error: error.message})
  }
}

export const newDesc = (group, text, user)=> async (dispatch)=>{
  dispatch({type: Set_Description_Request})
  try {
    const result = await axios.post(`${API_URL}group/description`, {group, text, user});
    dispatch({type: Set_Description_Success, payload: result.data})
  } catch (error) {
    dispatch({type: Set_Description_Failure, error: error.message})
  }
}