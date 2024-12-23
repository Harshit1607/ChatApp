import React from 'react'
import styles from './ChatHome.module.scss'
import ChatBox from '../ChatBox/ChatBox.jsx'
import ChatNav from '../ChatNav/ChatNav.jsx'
import ChatInput from '../ChatInput/ChatInput.jsx'

const ChatHome = () => {
  return (
    <div className={styles.main}>
      <ChatNav />
      <ChatBox />
      <ChatInput />
    </div>
  )
}

export default ChatHome