import { Load_Chat_Failure, Load_Chat_Request, Load_Chat_Success, New_Chat_Failure, New_Chat_Request, New_Chat_Success, View_Chat_Success } from "../actionTypes";


const initialState = {
  chats: sessionStorage.getItem('chats') ? JSON.parse(sessionStorage.getItem('chats')) : '',
  loading: false,
  error: null,
}

function chatReducer(state=initialState,action){
  switch(action.type){
    case Load_Chat_Request:
    case New_Chat_Request:
      return{
        ...state,
        loading: true,
        error:null
      }
    case Load_Chat_Success:
      sessionStorage.setItem('chats',JSON.stringify(action.payload.chats));
      return{
        ...state,
        chats:action.payload.chats,
        loading:false,
        error: null,
      }
    case New_Chat_Success:
      const newChats = [...state.chats, action.payload.newChat]
      sessionStorage.setItem('chats',JSON.stringify(newChats));
      return{
        ...state,
        chats:newChats,
        loading:false,
        error: null,
      }
    case View_Chat_Success:
      const updatedChats = state.chats.map(chat=>{
        const viewedChat = action.payload.viewedChats.find(view=>view._id === chat._id);
        return viewedChat? {...chat, ...viewedChat} : chat;
      })
      sessionStorage.setItem('chats',JSON.stringify(updatedChats));
      return{
        ...state,
        chats:updatedChats,
        loading:false,
        error: null,
      }
    case Load_Chat_Failure:
    case New_Chat_Failure:
      return{
        ...state,
        loading:false,
        error:action.error
      }
    default:
      return state;
  }
}

export default chatReducer