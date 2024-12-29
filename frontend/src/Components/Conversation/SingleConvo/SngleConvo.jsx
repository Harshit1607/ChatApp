import React, { useEffect, useState } from 'react'
import styles from './SingleConvo.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { openGroup } from '../../../Redux/Group/groupActions'
import { getLatestChat, onLatestChat } from '../../../Socket/ChatSocket'

const SngleConvo = ({single}) => {
  const {user} = useSelector(state=>state.userReducer);
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
    getLatestChat(single);
  }, [single, chats]);

  useEffect(()=>{

    const cleanup = onLatestChat((latestMessage) => {
      if(latestMessage.Group[0] === single._id){
        setMessage(latestMessage);
      }
      return;
    });

    console.log(message)

    return () => {
      cleanup(); // Clean up the listener on unmount
    };
  })
  


  const name = !single.isGroup && single.name === "" ? findName() : single.name;
  const handleClick = () =>{

    dispatch(openGroup(user, null, single));
  }
  return (
    <div className={styles.main} onClick={handleClick}>
      <div className={styles.pfp}>
        <div></div>
      </div>
      <div className={styles.info}>
        <span>{name}</span>
        <span>{message ? message.message.message : null}</span>
      </div>
      <div className={styles.others}>
        <div></div>
        <span>11:11 am</span>
      </div>
    </div>
  )
}

export default SngleConvo