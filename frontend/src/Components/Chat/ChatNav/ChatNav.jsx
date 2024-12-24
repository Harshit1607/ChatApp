import React from 'react'
import styles from './ChatNav.module.scss'
import { useSelector } from 'react-redux';

const ChatNav = () => {
  const {groupChat} = useSelector(state=>state.groupReducer);
  const {user} = useSelector(state=>state.userReducer);
  const findName = () => {
    let name;
    groupChat.UserDetails.forEach(each => {
      if (each._id != user._id) {
        name = each.name;
      }
    });
    return name; // returns the found name
  };
  
  const name = !groupChat.isGroup && groupChat.name === "" ? findName() : groupChat.name;
  
;  return (
    <div className={styles.main}>
      <div className={styles.pfp}>
        <div></div>
      </div>
      <div className={styles.info}>
        <span>{name}</span>
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