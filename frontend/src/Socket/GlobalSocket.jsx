import React, { useEffect } from 'react'
import { useDispatch } from "react-redux"
import {useNavigate} from 'react-router-dom';
import socket from "./Socket.jsx";
import { Call_Rejected, ICE_Candidate_Received, New_Admin, New_Chat_Success, New_Group_Created, Recieved_Answer, Recieved_Offer, Removed_From_Group, Set_Description_Success, Stop_Typing, Typing, Updated_Group, View_Chat_Success } from '../Redux/actionTypes.jsx';
import { otherStopTyping, otherTyping } from './ChatSocket.jsx';
import { storePeer } from '../Redux/Call/callActions.jsx';

const GlobalSocket = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate()

 
  useEffect(() => {

    const handleNewChat = ({ newChat }) => {
      console.log("new message recieved")
      dispatch({ type: New_Chat_Success, payload: { newChat } });
    };
  
    socket.on("new message", handleNewChat);

    const handleViewChat = ({viewedChats}) =>{
      dispatch({type:View_Chat_Success, payload: {viewedChats}});
    }
    
    socket.on("viewChat", handleViewChat)

  const handleTyping = ({ typing, by }) => {
    dispatch({type: Typing})
  };

  const handleStopTyping = ({ typing, by }) => {
    dispatch({type: Stop_Typing})
  };


  socket.on('typing', handleTyping);
  socket.on('stop typing', handleStopTyping);

  const handleNewAdmin = ({group, admins}) =>{
    console.log("new Admin")
    dispatch({type: New_Admin, payload:{group, admins} })
  }
  socket.on("NewAdmin", handleNewAdmin)

  const handleNewGroup = ({group, users, userDetails}) =>{
    console.log("someone removed or left")
    dispatch({type: Updated_Group, payload: {group, users, userDetails}})
  }
  socket.on("UpdatedGroup", handleNewGroup)

  const handleNewGroupCreated = ({groupChat})=>{
    console.log("new group created")
    dispatch({type: New_Group_Created, payload: {groupChat}})
  }
  socket.on("NewGroupCreated", handleNewGroupCreated)

  const handleRemovedFromGroup = ({group})=>{
    console.log("removed from group")
    dispatch({type: Removed_From_Group, payload: {group}})
  }
  socket.on("RemovedFromGroup", handleRemovedFromGroup);
  const handleDescription = ({desc, id})=>{
    dispatch({type: Set_Description_Success, payload: {desc, id}});
  }
  socket.on("Description", handleDescription);
    return () => {
      socket.off("viewChat", handleViewChat); 
      socket.off("new message", handleNewChat);
      socket.off('typing', handleTyping);
      socket.off('stop typing', handleStopTyping);
      socket.off("NewAdmin", handleNewAdmin);
      socket.off("UpdatedGroup", handleNewGroup);
      socket.off("NewGroupCreated", handleNewGroupCreated);
      socket.off("Description", handleDescription);
    };
  });

  return null;
}

export default GlobalSocket