import { All_Friends_Failure, All_Friends_Request, All_Friends_Success, All_Users_Failure, All_Users_Request, All_Users_Success, Close_Search, New_Admin, Search_Users_Failure, Search_Users_Request, Search_Users_Success, Sort_Groups, Updated_Group, New_Group_Created, Removed_From_Group, Create_Group_Success, Get_User_Request, Get_User_Failure, Get_User_Success, Change_Theme, Get_Latest_Chat, Open_Group_Success, SET_SIDEBAR_TAB } from "../actionTypes";

const initialState = {
  allUsers: localStorage.getItem('allUsers') ? JSON.parse(localStorage.getItem('allUsers')) : [],
  allFriends: localStorage.getItem('allFriends') ? JSON.parse(localStorage.getItem('allFriends')) : [],
  searchUsers: localStorage.getItem('searchUsers') ? JSON.parse(localStorage.getItem('searchUsers')) : [],
  newUser: '',
  theme: localStorage.getItem('theme') ? localStorage.getItem("theme") : 'og',
  activeTab: 'all', // Added for sidebar navigation
  latestChat: sessionStorage.getItem('latestChat')? JSON.parse(sessionStorage.getItem('latestChat')):[],
  loading: false,
  error: null,
}

function homeReducer(state=initialState,action){
  switch(action.type){
    case All_Users_Request:
    case All_Friends_Request:
    case Search_Users_Request:
    case Get_User_Request:
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
    case Open_Group_Success:
        const existing = state.allFriends.find(f => f._id === action.payload.groupChat._id);
        if (existing) return { ...state, loading: false };
        const newFriendsList = [action.payload.groupChat, ...state.allFriends];
        localStorage.setItem('allFriends', JSON.stringify(newFriendsList));
        return {
          ...state,
          allFriends: newFriendsList,
          loading: false,
          error: null
        }
    case Close_Search:
      localStorage.removeItem('searchUsers');
      return{
        ...state,
        searchUsers: [],
      }
    case Create_Group_Success:
      const newGroupSuccess = [...state.allFriends, action.payload.groupChat];
      localStorage.setItem('allFriends', JSON.stringify(newGroupSuccess));
      return{
        ...state,
        allFriends: newGroupSuccess
      }
    case Sort_Groups:
      if(!state.latestChat){
        return{
          ...state,
        }
      }else {
          const chats = state.latestChat;
          const sortedChats = [...chats].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          const groupLatestChats = {};
          sortedChats.forEach(chat => {
            const groupId = chat.Group?.[0]?.toString();
            if (groupId && (!groupLatestChats[groupId] || new Date(chat.createdAt) > new Date(groupLatestChats[groupId].createdAt))) {
              groupLatestChats[groupId] = chat;
            }
          });

          const sortedGroups = state.allFriends
            .map(group => {
              const groupId = group._id.toString();
              const latestChat = groupLatestChats[groupId] || null;
              return { ...group, latestChat };
            })
            .sort((a, b) => {
              const dateA = new Date(a.latestChat?.createdAt || 0).getTime();
              const dateB = new Date(b.latestChat?.createdAt || 0).getTime();
              return dateB - dateA;
            })
            .map(group => {
              const { latestChat, ...rest } = group;
              return rest;
            });

          localStorage.setItem('allFriends', JSON.stringify(sortedGroups));
          return {
            ...state,
            allFriends: [...sortedGroups],
          }; 
      }
    
      case New_Admin:
        const updatedFriends = state.allFriends.map(friend => {
          if (friend._id === action.payload.group) {
              return {
                  ...friend,
                  Admin: action.payload.admins
              };
          }
          return friend;
      });
  
      localStorage.setItem('allFriends', JSON.stringify(updatedFriends));
      return {
          ...state,
          allFriends: updatedFriends
      };
      
      case Updated_Group: 
      const newFriends = state.allFriends.map(friend =>{
        if(friend._id === action.payload.group){
          return{
            ...friend,
            Users: action.payload.users,
            UserDetails: action.payload.userDetails
          }
        }
        return friend;
      })
      localStorage.setItem('allFriends', JSON.stringify(newFriends));
      return {
          ...state,
          allFriends: newFriends
      };

    case New_Group_Created:
      const newGroupIncluded = [...state.allFriends, action.payload.groupChat];
      localStorage.setItem('allFriends', JSON.stringify(newGroupIncluded));
      return{
        ...state,
        allFriends: newGroupIncluded
      }
    case Removed_From_Group:
      const removedGroup = state.allFriends.filter(friend=> friend._id !== action.payload.group);
      localStorage.setItem('allFriends', JSON.stringify(removedGroup));
      return{
        ...state,
        allFriends: removedGroup,
      }
    case Get_User_Success:
      return{
        ...state,
        newUser: action.payload.newUser,
        error: null,
        loading: false,
      }
    case Change_Theme:
      localStorage.setItem("theme", action.payload);
      return{
        ...state,
        theme: action.payload,
      }
    case Get_Latest_Chat:
      const newChat = action.payload;
      if(newChat){
        const updatedChats = state.latestChat.filter(chat => chat.Group[0] !== newChat.Group[0]);
        sessionStorage.setItem('latestChat', JSON.stringify([...updatedChats, newChat]));
        return {
          ...state,
          latestChat: [...updatedChats, newChat],
        };
      }
      return state;
      
    case SET_SIDEBAR_TAB:
      return {
        ...state,
        activeTab: action.payload
      }
    case All_Users_Failure:
    case All_Friends_Failure:
    case Search_Users_Failure:
    case Get_User_Failure:
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