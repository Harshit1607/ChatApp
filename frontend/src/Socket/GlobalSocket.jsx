import React, { useEffect } from 'react'
import { useDispatch } from "react-redux";
import socket from "./Socket.jsx";
import { New_Chat_Success } from '../Redux/actionTypes.jsx';

const GlobalSocket = () => {
  const dispatch = useDispatch();

 
  useEffect(() => {

    const handleNewChat = ({ newChat }) => {
      dispatch({ type: New_Chat_Success, payload: { newChat } });
    };
  
    socket.on("new message", handleNewChat);
  
    return () => {
      socket.off("new message", handleNewChat);
    };
  });

  return null;
}

export default GlobalSocket