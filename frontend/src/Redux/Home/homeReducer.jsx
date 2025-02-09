import { act } from "react";
import { All_Friends_Failure, All_Friends_Request, All_Friends_Success, All_Users_Failure, All_Users_Request, All_Users_Success, Close_Search, New_Admin, Search_Users_Failure, Search_Users_Request, Search_Users_Success, Sort_Groups, Updated_Group, New_Group_Created, Removed_From_Group, Create_Group_Success, Get_User_Request, Get_User_Failure, Get_User_Success, Change_Theme, Get_Latest_Chat } from "../actionTypes";


const initialState = {
  allUsers: localStorage.getItem('allUsers') ? JSON.parse(localStorage.getItem('allUsers')) : '',
  allFriends: localStorage.getItem('allFriends') ? JSON.parse(localStorage.getItem('allFriends')) : '',
  searchUsers: localStorage.getItem('searchUsers') ? JSON.parse(localStorage.getItem('searchUsers')) : '',
  newUser: '',
  theme: localStorage.getItem('theme') ? localStorage.getItem("theme") : 'og',
  latestChat: [],
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
       // Retrieve and parse chats from sessionStorage
          const chats = state.latestChat;

          // Sort the chats by createdAt (most recent first)
          const sortedChats = [...chats].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          // Map to find the latest chat for each group
          const groupLatestChats = {};
          sortedChats.forEach(chat => {
            const groupId = chat.Group?.[0]?.toString(); // Assuming Group is an array
            if (groupId && (!groupLatestChats[groupId] || new Date(chat.createdAt) > new Date(groupLatestChats[groupId].createdAt))) {
              groupLatestChats[groupId] = chat;
            }
          });

          // Sort groups based on the latest chat's createdAt timestamp
          const sortedGroups = state.allFriends
            .map(group => {
              const groupId = group._id.toString();
              const latestChat = groupLatestChats[groupId] || null;
              return { ...group, latestChat };
            })
            .sort((a, b) => {
              const dateA = new Date(a.latestChat?.createdAt || 0).getTime();
              const dateB = new Date(b.latestChat?.createdAt || 0).getTime();
              return dateB - dateA; // Most recent first
            })
            .map(group => {
              // Remove the latestChat field after sorting
              const { latestChat, ...rest } = group;
              return rest;
            });

          // Store the sorted groups in localStorage
          localStorage.setItem('allFriends', JSON.stringify(sortedGroups));
          // Return the updated state
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
                  Admin: action.payload.admins // Update the `Admin` field
              };
          }
          return friend; // Keep the rest of the objects unchanged
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
      const updatedChats = state.latestChat.filter(chat => chat.Group[0] !== newChat.Group[0]);

      return {
        ...state,
        latestChat: [...updatedChats, newChat], // Add the new chat after filtering out the old one
      };
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