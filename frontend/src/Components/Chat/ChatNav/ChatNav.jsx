import React from 'react'
import styles from './ChatNav.module.scss'

const ChatNav = () => {
  return (
    <div className={styles.main}>
      <div className={styles.pfp}>
        <div></div>
      </div>
      <div className={styles.info}>
        <span>Name</span>
        <span>Last seen 11:11 am</span>
      </div>
      <div className={styles.callBox}>
        <div></div>
        <div></div>
      </div>
    </div>
  )
}

export default ChatNav