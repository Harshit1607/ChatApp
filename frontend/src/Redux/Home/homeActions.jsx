import axios from 'axios'
import { All_Users_Failure, All_Users_Request, All_Users_Success } from '../actionTypes';

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