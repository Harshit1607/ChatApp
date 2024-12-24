import React from 'react'
import SingleConvo from '../SingleConvo/SngleConvo'
import styles from './ConversationHome.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { openGroup } from '../../../Redux/Group/groupActions'

const ConversationHome = () => {
  const {allFriends} = useSelector(state=>state.homeReducer);
  
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
        {allFriends ? allFriends.map((single, index) => (
            <SingleConvo single={single} key={index}/>
        )): null}
      </div>
    </div>
  )
}

export default ConversationHome