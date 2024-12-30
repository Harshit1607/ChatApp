import { Load_Chat_Failure, Load_Chat_Request, Load_Chat_Success, New_Chat_Failure, New_Chat_Request, New_Chat_Success, Stop_Typing, Typing, View_Chat_Success } from "../actionTypes";


const initialState = {
  chats: sessionStorage.getItem('chats') ? JSON.parse(sessionStorage.getItem('chats')) : '',
  loading: false,
  error: null,
  typing: false
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
      const newChats = [action.payload.newChat,...state.chats ]
      sessionStorage.setItem('chats',JSON.stringify(newChats));
      return{
        ...state,
        chats:newChats,
        loading:false,
        error: null,
      }
    case View_Chat_Success:
      if(!action.payload || action.payload.viewedChats.length === 0){
        return{
          ...state
        }
      }else{
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
      }
      
    case Typing:
      return{
        ...state,
        typing: true,
      }
    case Stop_Typing:
      return{
        ...state,
        typing: false,
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