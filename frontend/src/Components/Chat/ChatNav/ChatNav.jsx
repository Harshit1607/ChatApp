import React from 'react'
import styles from './ChatNav.module.scss'
import { useSelector } from 'react-redux';

const ChatNav = () => {
  const {groupChat} = useSelector(state=>state.groupReducer);
  return (
    <div className={styles.main}>
      <div className={styles.pfp}>
        <div></div>
      </div>
      <div className={styles.info}>
        <span>{groupChat.name}</span>
        <span>Last seen 11:11 am</span>
      </div>
      <div className={styles.callBox}>
        <div></div>
        <div></div>
      </div>
    </div>
  )
}

export default ChatNav