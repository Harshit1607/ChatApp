import React from 'react'
import styles from'./SingleChat.module.scss'
import { useSelector } from 'react-redux'
import singleTick from '../../../Assets/singleTick.svg'
import doubleTick from '../../../Assets/doubleTick.png'

const SingleChat = ({chat}) => {

  const {user} = useSelector(state=>state.userReducer);

  function convertTo24HourFormat(dateString) {
    const date = new Date(dateString);

    // Get hours and minutes in 24-hour format
    const hours = date.getHours();  // 0-23
    const minutes = date.getMinutes();  // 0-59

    // Pad minutes with a leading zero if needed
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
}


  return (
    <div className={user._id  === chat.message.sentBy[0] ? styles.userMain :  styles.main}>
      <div className={user._id  === chat.message.sentBy[0] ? styles.userChat :  styles.chat}>
        <span>{chat.message.message}</span>
        <div><span>{convertTo24HourFormat(chat.createdAt)}</span>{user._id  === chat.message.sentBy[0] ? chat.message.viewedBy.length === chat.Users.length ? <img src={doubleTick} alt=''/>:  <img src={singleTick} alt=''/> : null}</div>
      </div>
      <div className={user._id  === chat.message.sentBy[0] ? styles.usertriangle :  styles.triangle}></div>
    </div>
  )
}

export default SingleChat