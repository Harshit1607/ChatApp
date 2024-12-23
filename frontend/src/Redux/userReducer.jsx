import { User_Login_Failure, User_Login_Request, User_Login_Success, User_Signup_Failure, User_Signup_Request, User_Signup_Success } from "./actionTypes"

const initialState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : "",
  loading: false,
  error: null,
}

function userReducer(state=initialState,action){
  switch(action.type){
    case User_Signup_Request:
    case User_Login_Request:
      return{
        ...state,
        loading: true,
        error: null,
      }
    case User_Signup_Success:
      localStorage.setItem('user',JSON.stringify(action.payload.user));
      return{
        ...state,
        user:action.payload.user,
        loading:false,
        error: null,
      }
    case User_Login_Success:
      
      localStorage.setItem('user',JSON.stringify(action.payload.user));
      return{
        ...state,
        user:action.payload.user,
        loading:false,
        error: null,
      }
    case User_Signup_Failure:
    case User_Login_Failure:
      return{
        ...state,
        loading:false,
        error:action.error
      }

    default:
      return state;
  }
}

export default userReducer