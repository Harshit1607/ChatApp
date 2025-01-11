import React, { useEffect } from 'react'
import { useDispatch } from "react-redux"
import {useNavigate} from 'react-router-dom';
import socket from "./Socket.jsx";
import { Call_Rejected, ICE_Candidate_Received, New_Admin, New_Chat_Success, Recieved_Answer, Recieved_Offer, Stop_Typing, Typing, Updated_Group, View_Chat_Success } from '../Redux/actionTypes.jsx';
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
    console.log("removed or left")
    dispatch({type: Updated_Group, payload: {group, users, userDetails}})
  }
  socket.on("UpdatedGroup", handleNewGroup)

  
  // Handle call rejection
  

  // Handle ICE candidate reception
  // const handleCandidate = ({ candidate }) => {
  //   dispatch({ type: ICE_Candidate_Received, payload: { candidate } });
  // };
  // socket.on('receiveCandidate', handleCandidate);

  

    return () => {
      socket.off("viewChat", handleViewChat)
      socket.off("new message", handleNewChat);
      socket.off('typing', handleTyping);
      socket.off('stop typing', handleStopTyping);
      socket.off("NewAdmin", handleNewAdmin);
      socket.off("UpdatedGroup", handleNewGroup)
    };
  });

  return null;
}

export default GlobalSocket