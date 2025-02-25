import React, { useState, useRef, useEffect } from 'react'
import styles from'./SingleChat.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import singleTick from '../../../Assets/singleTick.svg'
import doubleTick from '../../../Assets/doubleTick.svg'
import singleTickWhite from '../../../Assets/singleTickWhite.svg'
import doubleTickWhite from '../../../Assets/doubleTickWhite.svg'
import { getLanguages } from '../../../Redux/Translation/translationActions'
import { deleteForAll, deleteForMe } from '../../../Redux/Chat/chatActions'

const SingleChat = ({chat, visible, setVisibleChatId, index, chatOptions, setChatOptions }) => {
  const {user} = useSelector(state=>state.userReducer);
  const {groupChat} = useSelector(state=>state.groupReducer);
  const {theme} = useSelector(state=>state.homeReducer);
  const dispatch = useDispatch();
  const {isTranslating} = useSelector(state=>state.translationReducer);
  
  function convertTo24HourFormat(dateString) {
    const date = new Date(dateString);

    // Get hours and minutes in 24-hour format
    const hours = date.getHours();  // 0-23
    const minutes = date.getMinutes();  // 0-59

    // Pad minutes with a leading zero if needed
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
}

const viewDetailsRef = useRef(null);
const chatOptionRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      viewDetailsRef.current && 
      !viewDetailsRef.current.contains(event.target)
    ) {
      setVisibleChatId(null); // Close the viewDetails div when clicking outside
    }else if( chatOptionRef.current && 
      !chatOptionRef.current.contains(event.target)){
        setChatOptions(null)
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
const handleOptions = (e)=>{
  e.preventDefault();
  e.stopPropagation();
  setChatOptions(chatOptions ? null : chat._id)
}

  return (
    <div className={user._id  === chat.message.sentBy[0] ? styles.userMain :  styles.main}>
      <div className={user._id  === chat.message.sentBy[0] ? styles.userChat :  styles.chat} onContextMenu={handleOptions}>
        {chat.isMedia ? <img src={chat.message.message}/>:<span>{chat.message.message}</span>}
        <div>
          <span>{convertTo24HourFormat(chat.createdAt)}</span>
          <div onClick={handleToggle}>
            {user._id === chat.message.sentBy[0]
              ? chat.message.viewedBy.length === chat.Users.length
                ? <img src={theme === 'gw'?doubleTick: doubleTickWhite} alt="" />
                : <img src={theme === 'gw'?singleTick: singleTickWhite} alt="" />
              : null}
          </div>
        </div>
        <div className={styles.viewDetails} ref={viewDetailsRef} style={{visibility: visible? "" : "hidden", bottom: index === 0? "0": "auto", top: index === 0? "auto": "20%"}}>
          <div>
            <span>Viewed By</span>
            {
              chat.message.viewedBy.filter(each=>each !== user._id).map(each=>{
                return(
                  <span>{groupChat.UserDetails.find(e => e._id === each).name}</span>
                )
                })
            }
          </div>
          <div>
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
      <div className={styles.chatOption} ref={chatOptionRef} style={{visibility: chatOptions ? "" : "hidden", bottom: index === 0? "0": "auto", top: index === 0? "auto": "20%"}}>
        <button style={{visibility: user._id !== chat.message.sentBy[0] ? "" : "hidden"}}  onClick={()=>{dispatch(getLanguages(chat.message.message))
                              setChatOptions(chatOptions ? null : chat._id)
        }}>Translate</button>
        <button onClick={()=>dispatch(deleteForMe(chat._id, user._id))}>Delete for me</button>
        <button style={{display: user._id === chat.message.sentBy[0] ? "" : "none"}}  onClick={()=>dispatch(deleteForAll(chat._id, user._id))}>Delete For All</button>
      </div>
      </div>
      <div className={user._id  === chat.message.sentBy[0] ? styles.usertriangle :  styles.triangle}></div>
      {groupChat.isGroup && user._id !== chat.message.sentBy[0] && (
        <div className={styles.otherProfile}>
          {groupChat.UserDetails.find(each => each._id === chat.message.sentBy[0])?.name}
        </div>
      )}
    </div>
  )
}

export default SingleChat