import React, { useEffect, useState } from 'react'
import styles from './SingleConvo.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { openGroup } from '../../../Redux/Group/groupActions'
import { getLatestChat } from '../../../Socket/ChatSocket'
import spidermanFace from '../../../Assets/spidermanFace.svg'
import gwenFace from '../../../Assets/gwenFace.png'
import { leaveGroup } from '../../../Socket/GroupSocket'
import { getPhoto } from '../../../Redux/Home/homeActions'


const SngleConvo = ({single}) => {
  const {user} = useSelector(state=>state.userReducer);
  const {groupChat} = useSelector(state=>state.groupReducer);
  const {chats} = useSelector(state=>state.chatReducer);
  const {latestChat, theme} = useSelector(state=>state.homeReducer);
  const [message, setMessage] = useState("");
  
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

  const findProfile = () => {
    let profile;
    single.UserDetails.forEach(each => {
      if (each._id != user._id) {
        profile = each.profile;
      }
    });
    return profile; // returns the found name
  };

  useEffect(() => {
    getLatestChat(single._id);
  }, [chats?.length]);

  useEffect(()=>{
    if(latestChat.length > 0){
      const newChat = latestChat.find(each=>each.Group[0] === single._id);
    if(newChat){
      setMessage(newChat);
    }
    }
    
  }, [latestChat])

  const sentBy = (id) =>{
    const sent = single.UserDetails.find(each => each._id === id);
  return sent ? sent.name : undefined;
  }
  const name = !single.isGroup && single.name === "" ? findName() : single.name;
  const profile = !single.isGroup && single.profile === "" ? findProfile() : single.profile;
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
    <div className={styles.main} onClick={handleClick} >
      <div className={styles.pfp}>
        <div>
          {profile && <img src={profile} alt ="" />}
        </div>
      </div>
      <div className={styles.info}>
        <span>{name}</span>
        <span>{message ? `${message.message.sentBy[0]===user._id ? "You": (single.isGroup? sentBy(message.message.sentBy[0]): name)} : ${message.message.message}`  : null}</span>
      </div>
      <div className={styles.others}>
        <div>
          {message && !message.message.viewedBy.includes(user._id) && (groupChat ? (message.Group !== groupChat._id) : true) ? <img src={theme === 'gw'? gwenFace: spidermanFace} /> : null}
        </div>
        <span>{message && message.createdAt ? formatDateTime(message.createdAt) : ""}</span>
      </div>
    </div>
  )
}

export default SngleConvo