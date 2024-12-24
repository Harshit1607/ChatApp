import { All_Users_Failure, All_Users_Request, All_Users_Success } from "../actionTypes";


const initialState = {
  allUsers: localStorage.getItem('allUsers') ? JSON.parse(localStorage.getItem('allUsers')) : '',
  loading: false,
  error: null,
}

function homeReducer(state=initialState,action){
  switch(action.type){
    case All_Users_Request:
      return{
        ...state,
        loading: true,
        error:null
      }
    case All_Users_Success:
      localStorage.setItem('allUsers',JSON.stringify(action.payload.allUsers));
      return{
        ...state,
        allUsers:action.payload.allUsers,
        loading:false,
        error: null,
      }
    case All_Users_Failure:
      return{
        ...state,
        loading:false,
        error:action.error
      }
    default:
      return state;
  }
}

export default homeReducer