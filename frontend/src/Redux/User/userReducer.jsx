import { Change_Photo_Failure, Change_Photo_Request, Change_Photo_Success, Delete_Photo_Failure, Delete_Photo_Request, Delete_Photo_Success, Logout, Set_AboutMe_Failure, Set_AboutMe_Request, Set_AboutMe_Success, User_Login_Failure, User_Login_Request, User_Login_Success, User_Signup_Failure, User_Signup_Request, User_Signup_Success } from "../actionTypes"

const initialState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : "",
  loading: false,
  error: null,
}

function userReducer(state=initialState,action){
  switch(action.type){
    case User_Signup_Request:
    case User_Login_Request:
    case Change_Photo_Request:
    case Delete_Photo_Request:
    case Set_AboutMe_Request:
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
    case Change_Photo_Success:
      localStorage.setItem('user',JSON.stringify(action.payload.user));
      return{
        ...state,
        user:action.payload.user,
        loading:false,
        error: null,
      }
    case Delete_Photo_Success:
      localStorage.setItem('user',JSON.stringify(action.payload.user));
      return{
        ...state,
        user:action.payload.user,
        loading:false,
        error: null,
      }
    case Logout:
      localStorage.clear();
      sessionStorage.clear();
      return{
        ...state,
        user: null,
        loading:false,
        error: null,
      }
    case Set_AboutMe_Success:
      const newUser = {...state.user, about: action.payload.desc}
      localStorage.setItem('user',JSON.stringify(newUser));
      return{
        ...state,
        user: newUser,
        loading:false,
        error: null,
      }
    case User_Signup_Failure:
    case User_Login_Failure:
    case Change_Photo_Failure:
    case Delete_Photo_Failure:
    case Set_AboutMe_Failure:
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