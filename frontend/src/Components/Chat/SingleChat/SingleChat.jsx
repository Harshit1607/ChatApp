import React from 'react'
import styles from'./SingleChat.module.scss'
import { useSelector } from 'react-redux'

const SingleChat = ({chat}) => {
  const {user} = useSelector(state=>state.userReducer);
  return (
    <div className={user._id  === chat.message.sentBy[0] ? styles.userMain :  styles.main}>
      <div className={user._id  === chat.message.sentBy[0] ? styles.userChat :  styles.chat}>
        <span>{chat.message.message}</span>
      </div>
    </div>
  )
}

export default SingleChat