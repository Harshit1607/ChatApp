import React from 'react'
import SingleConvo from '../SingleConvo/SngleConvo'
import styles from './ConversationHome.module.scss'

const ConversationHome = () => {
  return (
    <div className={styles.main}>
      <div className={styles.heading}>
        <span>Conversations</span>
      </div>
      <div className={styles.searchBar}>
        <input />
      </div>
      <div className={styles.covoContainer}>
        <span>Recent Chats</span>
        <SingleConvo />
      </div>
    </div>
  )
}

export default ConversationHome