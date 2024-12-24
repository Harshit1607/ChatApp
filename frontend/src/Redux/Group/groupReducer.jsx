import { Open_Group_Failure, Open_Group_Request, Open_Group_Success } from "../actionTypes";


const initialState = {
  groupChat: sessionStorage.getItem('groupChat') ? JSON.parse(sessionStorage.getItem('groupChat')) : null,
  loading: false,
  error: null,
}

function groupReducer(state=initialState,action){
  switch(action.type){
    case Open_Group_Request:
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
    case Open_Group_Failure:
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