import axios from 'axios'
import { Delete_ForAll_Failure, Delete_ForAll_Request, Delete_ForAll_Success, Delete_ForMe_Failure, Delete_ForMe_Request, Delete_ForMe_Success, Load_Chat_Failure, Load_Chat_Request, Load_Chat_Success, New_Chat_Failure, New_Chat_Request, New_Chat_Success } from '../actionTypes';
import { sendNewChat } from '../../Socket/ChatSocket';


const API_URL = process.env.REACT_APP_SERVER_URL;

export const loadChats = (group, user) => async (dispatch)=>{
  dispatch({type: Load_Chat_Request})
  
  try {
    const result = await axios.post(`${API_URL}chat/all`,{group, user});
    
    dispatch({type: Load_Chat_Success, payload: result.data})
  } catch (error) {
    dispatch({type: Load_Chat_Failure, payload: error.message})
  }
}

export const newChat = (text, user, group, isMedia=false) => async (dispatch)=>{
  dispatch({type: New_Chat_Request})

  sendNewChat(text, user, group, isMedia); // Emit the new chat message via socket
  
}

export const deleteForMe = (chat, user)=> async (dispatch)=>{
  dispatch({type: Delete_ForMe_Request});
  try {
    const result = await axios.post(`${API_URL}chat/delete`,{chat, user});
    dispatch({type: Delete_ForMe_Success, payload: result.data})
  } catch (error) {
    dispatch({type: Delete_ForMe_Failure, error: error.message})
  }
}

export const deleteForAll = (chat, user)=> async (dispatch)=>{
  dispatch({type: Delete_ForAll_Request});
  try {
    const result = await axios.post(`${API_URL}chat/deleteAll`,{chat, user});
    dispatch({type: Delete_ForAll_Success, payload: result.data})
  } catch (error) {
    dispatch({type: Delete_ForAll_Failure, error: error.message})
  }
}
