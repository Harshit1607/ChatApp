import axios from 'axios'
import { Close_Chat, Close_Group, Create_Group_Failure, Create_Group_Request, Create_Group_Success, Make_Group, Open_Group_Failure, Open_Group_Request, Open_Group_Success } from '../actionTypes';

const API_URL = process.env.REACT_APP_SERVER_URL;

export const openGroup = (user, other, group=null) => async (dispatch) =>{
  dispatch({type: Open_Group_Request})
  
  try {
    const result = await axios.post(`${API_URL}group/open`,{user, other, group});
    dispatch({type: Open_Group_Success, payload: result.data})
  } catch (error) {
    dispatch({type: Open_Group_Failure, error: error.message})
  }
}

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