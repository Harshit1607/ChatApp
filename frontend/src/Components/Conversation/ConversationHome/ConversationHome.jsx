import React from 'react'
import SingleConvo from '../SingleConvo/SngleConvo'
import styles from './ConversationHome.module.scss'
import { useSelector } from 'react-redux'

const ConversationHome = () => {
  const {allUsers} = useSelector(state=>state.homeReducer);
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
        {allUsers ? allUsers.map((single, index) => (
            <SingleConvo single={single} key={index}/>
        )): null}
      </div>
    </div>
  )
}

export default ConversationHome