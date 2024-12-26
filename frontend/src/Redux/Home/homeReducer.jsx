import { All_Friends_Failure, All_Friends_Request, All_Friends_Success, All_Users_Failure, All_Users_Request, All_Users_Success, Search_Users_Failure, Search_Users_Request, Search_Users_Success } from "../actionTypes";


const initialState = {
  allUsers: localStorage.getItem('allUsers') ? JSON.parse(localStorage.getItem('allUsers')) : '',
  allFriends: localStorage.getItem('allFriends') ? JSON.parse(localStorage.getItem('allFriends')) : '',
  searchUsers: localStorage.getItem('searchUsers') ? JSON.parse(localStorage.getItem('searchUsers')) : '',
  loading: false,
  error: null,
}

function homeReducer(state=initialState,action){
  switch(action.type){
    case All_Users_Request:
    case All_Friends_Request:
    case Search_Users_Request:
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
    case All_Friends_Success:
      localStorage.setItem('allFriends',JSON.stringify(action.payload.allFriends));
      return{
        ...state,
        allFriends:action.payload.allFriends,
        loading:false,
        error: null,
      }
    case Search_Users_Success:
      localStorage.setItem('searchUsers',JSON.stringify(action.payload.searchUsers));
      return{
        ...state,
        searchUsers:action.payload.searchUsers,
        loading:false,
        error: null,
      }
    case All_Users_Failure:
    case All_Friends_Failure:
    case Search_Users_Failure:
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