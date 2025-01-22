import axios from 'axios'
import { Get_Languages_Failure, Get_Languages_Request, Get_Languages_Success } from '../actionTypes'

const API_URL = process.env.REACT_APP_SERVER_URL;

export const getLanguages = ()=> async (dispatch)=>{
  dispatch({type: Get_Languages_Request})
  try {
    const result = await axios.get(`${API_URL}translation/`);
    console.log(result.data)
    dispatch({type: Get_Languages_Success, payload: result.data});
  } catch (error) {
    dispatch({type: Get_Languages_Failure, payload: error.message});
  }
}