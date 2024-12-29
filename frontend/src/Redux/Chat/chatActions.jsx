import axios from 'axios'
import { Load_Chat_Failure, Load_Chat_Request, Load_Chat_Success, New_Chat_Failure, New_Chat_Request, New_Chat_Success } from '../actionTypes';
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

export const newChat = (text, user, group) => async (dispatch)=>{
  dispatch({type: New_Chat_Request})

  sendNewChat(text, user, group); // Emit the new chat message via socket
  
}
