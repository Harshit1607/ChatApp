import { Get_Languages_Failure, Get_Languages_Request, Get_Languages_Success } from "../actionTypes";

const initialState = {
  loading: false,
  error: null,
  languages: null,
};

function translationReducer(state = initialState, action){
  switch(action.type){
    case Get_Languages_Request:
      return{
        ...state,
        loading: true,
        error: null,
      }
    case Get_Languages_Success:
      return{
        ...state,
        languages: action.payload
      }
    case Get_Languages_Failure:
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