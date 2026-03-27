import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import styles from './ChatHome.module.scss';
import ChatBox from '../ChatBox/ChatBox.jsx';
import ChatNav from '../ChatNav/ChatNav.jsx';
import ChatInput from '../ChatInput/ChatInput.jsx';
import { checkUser } from '../../../Socket/ChatSocket.jsx';

const ChatHome = () => {
  const { groupChat } = useSelector(state => state.groupReducer);
  const { user } = useSelector(state => state.userReducer);
  
  const isOpen = groupChat !== null;

  useEffect(() => {
    if (groupChat && !groupChat.isGroup) {
      const otherUser = groupChat.UserDetails.find(u => u._id !== user._id);
      if (otherUser) checkUser(otherUser._id);
    }
  }, [groupChat, user._id]);
  
  return (
    <div className={styles.main}>
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div 
            key="active-chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={styles.activeChatWrapper}
          >
            <ChatNav />
            <ChatBox />
            <ChatInput />
          </motion.div>
        ) : (
          <motion.div 
            key="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.emptyState}
          >
            <div className={styles.spiderSenseCircle}>
              <div className={styles.pulse} />
              <div className={styles.pulse2} />
              <span className={styles.spiderIcon}>🕸️</span>
            </div>
            <h2>The Multiverse Awaits</h2>
            <p>Sync your Spider-Sense and select a contact to start swinging through the web.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatHome;

