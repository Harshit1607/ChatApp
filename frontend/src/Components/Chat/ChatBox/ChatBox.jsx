import React, { useEffect, useState } from 'react'
import styles from './ChatBox.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { loadChats } from '../../../Redux/Chat/chatActions';
import SingleChat from '../SingleChat/SingleChat';
import { otherStopTyping, otherTyping, viewChat } from '../../../Socket/ChatSocket';
import spider from '../../../Assets/redSpider.svg'

const ChatBox = () => {
  const {groupChat} = useSelector(state=>state.groupReducer);
  const {user} = useSelector(state=>state.userReducer);
  const {chats, typing} = useSelector(state=>state.chatReducer);
  
  const dispatch = useDispatch();
  useEffect(()=>{
    dispatch(loadChats(groupChat, user));
  }, [groupChat])
  useEffect(()=>{
    viewChat(groupChat, user)
  }, [chats])

  return (
    <div className={styles.main}>
      <div style={{"display": !typing? "none" : ""}} className={styles.typingIndicator}>
        <img src={spider} alt="" />
        <img src={spider} alt="" />
        <img src={spider} alt="" />
        <img src={spider} alt="" />
      </div>
      {
        groupChat && chats && chats.length > 0? chats.filter(chat=>chat.Group[0] === groupChat._id).map((chat, index)=>(
          <SingleChat chat={chat} key={index}/>
        )): null
      }
    </div>
  )
}

export default ChatBox