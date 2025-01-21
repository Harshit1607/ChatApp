import React, { useState, useRef, useEffect } from 'react'
import styles from'./SingleChat.module.scss'
import { useSelector } from 'react-redux'
import singleTick from '../../../Assets/singleTick.svg'
import doubleTick from '../../../Assets/doubleTick.png'

const SingleChat = ({chat, visible, setVisibleChatId, index }) => {
  const {user} = useSelector(state=>state.userReducer);
  const {groupChat} = useSelector(state=>state.groupReducer);
  

  function convertTo24HourFormat(dateString) {
    const date = new Date(dateString);

    // Get hours and minutes in 24-hour format
    const hours = date.getHours();  // 0-23
    const minutes = date.getMinutes();  // 0-59

    // Pad minutes with a leading zero if needed
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
}

const viewDetailsRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      viewDetailsRef.current && 
      !viewDetailsRef.current.contains(event.target)
    ) {
      setVisibleChatId(null); // Close the viewDetails div when clicking outside
    }
  };

  // Attach the event listener
  window.addEventListener('click', handleClickOutside);

  // Cleanup the event listener on component unmount
  return () => {
    window.removeEventListener('click', handleClickOutside);
  };
}, [visible]);

const handleToggle = (e) => {
  e.stopPropagation();
  setVisibleChatId(visible ? null : chat._id); // Toggle visibility for this chat
};


  return (
    <div className={user._id  === chat.message.sentBy[0] ? styles.userMain :  styles.main}>
      <div className={user._id  === chat.message.sentBy[0] ? styles.userChat :  styles.chat}>
        <span>{chat.message.message}</span>
        <div>
          <span>{convertTo24HourFormat(chat.createdAt)}</span>
          <div onClick={handleToggle}>
            {user._id === chat.message.sentBy[0]
              ? chat.message.viewedBy.length === chat.Users.length
                ? <img src={doubleTick} alt="" />
                : <img src={singleTick} alt="" />
              : null}
          </div>
        </div>
        <div className={styles.viewDetails} ref={viewDetailsRef} style={{visibility: visible? "" : "hidden", bottom: index === 0? "0": "auto", top: index === 0? "auto": "20%"}}>
        <div className={styles.viewed}>
          <span>Viewed By</span>
          {
            chat.message.viewedBy.filter(each=>each !== user._id).map(each=>{
              return(
                
                <span>{groupChat.UserDetails.find(e => e._id === each).name}</span>
              )
              })
          }
        </div>
        <div className={styles.sent}>
          <span>Sent to</span>
          {
            chat.Users.filter(each=> !chat.message.viewedBy.includes(each)).map(each=>{ 
              return(
                <span>{groupChat.UserDetails.find(e => e._id === each).name}</span>
              )
              })
          }
        </div>
      </div>
      </div>
      <div className={user._id  === chat.message.sentBy[0] ? styles.usertriangle :  styles.triangle}></div>
      
    </div>
  )
}

export default SingleChat