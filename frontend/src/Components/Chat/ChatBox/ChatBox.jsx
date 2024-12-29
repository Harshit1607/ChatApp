import React, { useEffect } from 'react'
import styles from './ChatBox.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { loadChats } from '../../../Redux/Chat/chatActions';
import SingleChat from '../SingleChat/SingleChat';
import { viewChat } from '../../../Socket/ChatSocket';

const ChatBox = () => {
  const {groupChat} = useSelector(state=>state.groupReducer);
  const {user} = useSelector(state=>state.userReducer);
  const {chats} = useSelector(state=>state.chatReducer);
  const dispatch = useDispatch();
  useEffect(()=>{
    dispatch(loadChats(groupChat, user));
  }, [groupChat])
  useEffect(()=>{
    viewChat(groupChat, user)
  }, [chats])
  return (
    <div className={styles.main}>
      {
        groupChat && chats && chats.length > 0? chats.filter(chat=>chat.Group[0] === groupChat._id).map((chat, index)=>(
          <SingleChat chat={chat} key={index}/>
        )): null
      }
    </div>
  )
}

export default ChatBox