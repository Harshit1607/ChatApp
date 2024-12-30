import React, { useEffect } from 'react'
import { useDispatch } from "react-redux";
import socket from "./Socket.jsx";
import { New_Chat_Success, Stop_Typing, Typing, View_Chat_Success } from '../Redux/actionTypes.jsx';
import { otherStopTyping, otherTyping } from './ChatSocket.jsx';

const GlobalSocket = () => {
  const dispatch = useDispatch();

 
  useEffect(() => {

    const handleNewChat = ({ newChat }) => {
      console.log(" xf ")
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

    return () => {
      socket.off("viewChat", handleViewChat)
      socket.off("new message", handleNewChat);
      socket.off('typing', handleTyping);
      socket.off('stop typing', handleStopTyping);
    };
  });

  return null;
}

export default GlobalSocket