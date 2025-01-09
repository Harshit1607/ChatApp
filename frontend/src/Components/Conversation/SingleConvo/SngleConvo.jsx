import React, { useEffect, useState } from 'react'
import styles from './SingleConvo.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { openGroup } from '../../../Redux/Group/groupActions'
import { getLatestChat, onLatestChat } from '../../../Socket/ChatSocket'
import spidermanFace from '../../../Assets/spidermanFace.svg'
import { leaveGroup } from '../../../Socket/GroupSocket'

const SngleConvo = ({single}) => {
  const {user} = useSelector(state=>state.userReducer);
  const {groupChat} = useSelector(state=>state.groupReducer);
  const {chats} = useSelector(state=>state.chatReducer);
  const [message, setMessage] = useState("")

  const dispatch = useDispatch();

  const findName = () => {
    let name;
    single.UserDetails.forEach(each => {
      if (each._id != user._id) {
        name = each.name;
      }
    });
    return name; // returns the found name
  };

  useEffect(() => {
    getLatestChat(single._id);
  }, [chats?.length]);

  useEffect(()=>{

    const cleanup = onLatestChat((latestMessage) => {
      if(latestMessage.Group[0] === single._id){
        setMessage(latestMessage);
      }
      return;
    });

    return () => {
      cleanup(); // Clean up the listener on unmount
    };
  })

  const sentBy = (id) =>{
    const sent = single.UserDetails.find(each => each._id === id);
  return sent ? sent.name : undefined;
  }

  const name = !single.isGroup && single.name === "" ? findName() : single.name;
  const handleClick = () =>{
    if(groupChat){
      leaveGroup(groupChat._id)
    }
    dispatch(openGroup(user, null, single));
  }

  const formatDateTime =(timestamp)=> {
    const now = Date.now();
    const elapsed = now - timestamp; // Difference in milliseconds
    const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in 24 hours
  
    const dateObj = new Date(timestamp);
  
    if (elapsed > oneDay) {
      // If more than 24 hours, return the date in a readable format
      return dateObj.toLocaleDateString(); // Example: "12/31/2024" (MM/DD/YYYY format)
    } else {
      // If less than 24 hours, return the time in a readable format
      return dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); // Example: "12:45 PM"
    }
  }

  return (
    <div className={styles.main} onClick={handleClick}>
      <div className={styles.pfp}>
        <div></div>
      </div>
      <div className={styles.info}>
        <span>{name}</span>
        <span>{message ? `${message.message.sentBy[0]===user._id ? "You": (single.isGroup? sentBy(message.message.sentBy[0]): name)} : ${message.message.message}`  : null}</span>
      </div>
      <div className={styles.others}>
        <div>
          {message && !message.message.viewedBy.includes(user._id) && (groupChat ? (message.Group !== groupChat._id) : true) ? <img src={spidermanFace} /> : null}
        </div>
        <span>{message && message.createdAt ? formatDateTime(message.createdAt) : ""}</span>
      </div>
    </div>
  )
}

export default SngleConvo