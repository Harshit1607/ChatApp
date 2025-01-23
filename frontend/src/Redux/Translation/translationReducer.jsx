import { Get_Languages_Failure, Get_Languages_Request, Get_Languages_Success, Translate_Text_Failure, Translate_Text_Request, Translate_Text_Success } from "../actionTypes";

const initialState = {
  loading: false,
  error: null,
  languages: sessionStorage.getItem('language') ? JSON.parse(sessionStorage.getItem('language')) : null,
  isTranslating: false,
  toTranslate: null,
  translatedText: null,
};

function translationReducer(state = initialState, action){
  switch(action.type){
    case Get_Languages_Request:
    case Translate_Text_Request:
      return{
        ...state,
        loading: true,
        error: null,
      }
    case Get_Languages_Success:
      sessionStorage.setItem('language',JSON.stringify(action.payload.langs));
      return{
        ...state,
        languages: action.payload.langs,
        error: null,
        loading: false,
        isTranslating: true,
        toTranslate: action.payload.text
      }
    case Translate_Text_Success:
      return{
        ...state,
        error: null,
        loading: false,
        isTranslating: false,
        translatedText: action.payload.translatedText,
      }
    case Get_Languages_Failure:
    case Translate_Text_Failure:
      return{
        ...state,
        loading: false,
        error: action.payload.error
      }
    default:
      return state
  }
}

export default translationReducer;