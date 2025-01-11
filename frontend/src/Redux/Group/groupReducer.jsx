import { Change_GroupPhoto_Failure, Change_GroupPhoto_Request, Change_GroupPhoto_Success, Close_Chat, Close_Group, Create_Group_Failure, Create_Group_Request, Create_Group_Success, Leave_Group_Failure, Leave_Group_Request, Leave_Group_Success, Make_Admin_Failure, Make_Admin_Request, Make_Admin_Success, Make_Group, Open_Group_Failure, Open_Group_Request, Open_Group_Success } from "../actionTypes";
import { makeGroup } from "./groupActions";


const initialState = {
  groupChat: sessionStorage.getItem('groupChat') ? JSON.parse(sessionStorage.getItem('groupChat')) : null,
  loading: false,
  error: null,
  makeGroup: false,
}

function groupReducer(state=initialState,action){
  switch(action.type){
    case Open_Group_Request:
    case Create_Group_Request:
    case Change_GroupPhoto_Request:
    case Leave_Group_Request:
    case Make_Admin_Request:
      return{
        ...state,
        loading: true,
        error:null
      }
    case Open_Group_Success:
      sessionStorage.setItem('groupChat',JSON.stringify(action.payload.groupChat));
      return{
        ...state,
        groupChat:action.payload.groupChat,
        loading:false,
        error: null,
      }
    case Create_Group_Success:
      sessionStorage.setItem('groupChat',JSON.stringify(action.payload.groupChat));
      return{
        ...state,
        groupChat:action.payload.groupChat,
        loading:false,
        error: null,
      }
    case Make_Group:
      return{
        ...state,
        makeGroup: true,
      }
    case Close_Group:
      return{
        ...state,
        makeGroup: false,
      }
    case Close_Chat:
      sessionStorage.removeItem('groupChat');
      return{
        ...state,
        groupChat: null,
      }
    case Change_GroupPhoto_Success:
      sessionStorage.setItem('groupChat',JSON.stringify(action.payload.groupChat));
      return{
        ...state,
        groupChat:action.payload.groupChat,
        loading:false,
        error: null,
      }
    case Leave_Group_Success:
      const newGroup = action.payload.groupChat;
      const user = JSON.parse(localStorage.getItem('user'));
      if(!newGroup.Users.includes(user._id) || !newGroup){
        sessionStorage.removeItem('groupChat');
        return{
          ...state,
          groupChat: null,
          loading:false,
          error: null,
        }
      }else{
        sessionStorage.setItem('groupChat',JSON.stringify(newGroup));
      return{
        ...state,
        groupChat: newGroup,
        loading:false,
        error: null,
      }
      }
    case Make_Admin_Success:
      sessionStorage.setItem('groupChat',JSON.stringify(newGroup));
      return{
        ...state,
        groupChat: newGroup,
        loading:false,
        error: null,
      }
    case Open_Group_Failure:
    case Create_Group_Failure:
    case Change_GroupPhoto_Failure:
    case Leave_Group_Failure:
    case Make_Admin_Failure:
      return{
        ...state,
        loading:false,
        error:action.error
      }
    default:
      return state;
  }
}

export default groupReducer