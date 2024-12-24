import React, { useEffect, useState } from 'react';
import styles from './ChatHome.module.scss';
import ChatBox from '../ChatBox/ChatBox.jsx';
import ChatNav from '../ChatNav/ChatNav.jsx';
import ChatInput from '../ChatInput/ChatInput.jsx';
import { useSelector } from 'react-redux';

const ChatHome = () => {
  const { groupChat } = useSelector(state => state.groupReducer);
  const [isOpen, setIsOpen] = useState(false); // Initialize with false

  useEffect(() => {
    setIsOpen(groupChat !== null); // Update isOpen based on groupChat
  }, [groupChat]);

  console.log(isOpen);

  return (
    <div className={styles.main}>
      {isOpen ? (
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
