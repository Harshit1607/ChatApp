import axios from 'axios'
import { Get_Languages_Failure, Get_Languages_Request, Get_Languages_Success, Translate_Text_Failure, Translate_Text_Request, Translate_Text_Success } from '../actionTypes'

const API_URL = process.env.REACT_APP_SERVER_URL;

export const getLanguages = (text)=> async (dispatch)=>{
  dispatch({type: Get_Languages_Request})
  try {
    if(sessionStorage.getItem('language')){
      dispatch({type: Get_Languages_Success, payload: {langs: JSON.parse(sessionStorage.getItem('language')), text}});
      return;
    }
    const result = await axios.get(`${API_URL}translation/`);
    dispatch({type: Get_Languages_Success, payload: {langs: result.data, text}});
  } catch (error) {
    dispatch({type: Get_Languages_Failure, payload: error.message});
  }
}

export const translateText = (text, code)=> async(dispatch)=>{
  dispatch({type: Translate_Text_Request})
  try {
    const result = await axios.post(`${API_URL}translation/text`, {text, code})
    dispatch({type: Translate_Text_Success, payload: result.data})
  } catch (error) {
    dispatch({type: Translate_Text_Failure, payload: error.message});
  }
}