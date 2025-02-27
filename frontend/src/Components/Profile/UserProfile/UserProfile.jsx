import React from 'react'
import styles from './UserProfile.module.scss'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import call from '../../../Assets/call.svg'
import video from '../../../Assets/video.svg'
import { makeCall, onlyAudio } from '../../../Redux/Call/callActions';
import Carousel from '../../../Utils/Carousel/Carousel';

const UserProfile = () => {
  const {newUser} = useSelector(state=>state.homeReducer);
  const {user} = useSelector(state=>state.userReducer);
  const {chats} = useSelector(state=>state.chatReducer);
  const {groupChat} = useSelector(state=>state.groupReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  if(!newUser){
    return;
  }
  return (
    <div className={styles.main}>
      <div className={styles.topLeft}></div>
      <div className={styles.bottomLeft}></div>
      <div className={styles.right}>
        <div className={styles.mainInfo}>
          <div className={styles.profile}>
            <div></div>
          </div>
          <span>{newUser.name}</span>
          <span>{newUser.about}</span>
        </div>
        <div className={styles.extraInfo} >
          <div>
            <span>Phone number</span>
            <span>{newUser.phone}</span>
          </div>
          <div>
            <div onClick={()=>{dispatch(onlyAudio());
              dispatch(makeCall());
            }}><img src={call}/></div>
            <div onClick={()=>{dispatch(makeCall())}}><img src={video}/></div>
          </div>
        </div>
        <div className={styles.media}>
          <span>Media</span>
          <Carousel length={5} >
          {groupChat && chats && chats.length > 0
          ? chats
              .filter((chat) => chat.Group[0] === groupChat._id && chat.Users.includes(user._id) && chat.isMedia)
              .map((chat, index) => (
                  <img src={chat.message.message}/>
              ))
          : null}
            
          </Carousel>
        </div>
      </div>
      <div className={styles.cut} onClick={()=>navigate('/home')}>X</div>
    </div>
  )
}

export default UserProfile