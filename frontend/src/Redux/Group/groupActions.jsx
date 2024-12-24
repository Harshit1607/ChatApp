import axios from 'axios'
import { Open_Group_Failure, Open_Group_Request, Open_Group_Success } from '../actionTypes';

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