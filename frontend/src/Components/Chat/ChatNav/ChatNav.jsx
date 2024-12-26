import React from 'react'
import styles from './ChatNav.module.scss'
import { useDispatch, useSelector } from 'react-redux';
import call from '../../../Assets/call.svg'
import video from '../../../Assets/video.svg'
import cross from '../../../Assets/cross.svg'
import { closeChat } from '../../../Redux/Group/groupActions';

const ChatNav = () => {
  const {groupChat} = useSelector(state=>state.groupReducer);
  const {user} = useSelector(state=>state.userReducer);
  const dispatch = useDispatch();
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
        <div>
          <img src={call} alt="" />
        </div>
        <div>
          <img src={video} alt="" />
        </div>
        <div onClick={()=>{dispatch(closeChat())}}>
          <img src={cross} alt="" />
        </div>
      </div>
    </div>
  )
}

export default ChatNav