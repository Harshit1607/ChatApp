import React from 'react'
import styles from './SingleConvo.module.scss'
import { useSelector } from 'react-redux'

const SngleConvo = ({single}) => {
  const {user} = useSelector(state=>state.userReducer);
  return (
    <div className={styles.main}>
      <div className={styles.pfp}>
        <div></div>
      </div>
      <div className={styles.info}>
        <span>{single.name} {user._id === single._id ? "(You)" : ""}</span>
        <span>Message....</span>
      </div>
      <div className={styles.others}>
        <div></div>
        <span>11:11 am</span>
      </div>
    </div>
  )
}

export default SngleConvo