import React, { useEffect, useState } from 'react';
import styles from './ChatHome.module.scss';
import ChatBox from '../ChatBox/ChatBox.jsx';
import ChatNav from '../ChatNav/ChatNav.jsx';
import ChatInput from '../ChatInput/ChatInput.jsx';
import { useSelector } from 'react-redux';
import { checkUser } from '../../../Socket/ChatSocket.jsx';

const ChatHome = () => {
  const { groupChat } = useSelector(state => state.groupReducer);
  const { user } = useSelector(state => state.userReducer);
  const [isOpen, setIsOpen] = useState(false); // Initialize with false

  useEffect(() => {
    setIsOpen(groupChat !== null); // Update isOpen based on groupChat
    if(groupChat && !groupChat.isGroup){
      const otherUser = groupChat.UserDetails.find(u=>u._id !== user._id)
      checkUser(otherUser);
    }
  }, [groupChat]);

  return (
    <div className={styles.main}>
      {isOpen && groupChat ? (
        <>
          <ChatNav />
          <ChatBox />
          <ChatInput />
        </>
      ) : null}
    </div>
  );
};

export default ChatHome;
