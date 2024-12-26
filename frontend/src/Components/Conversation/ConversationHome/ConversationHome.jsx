import React, {useCallback} from 'react'
import SingleConvo from '../SingleConvo/SngleConvo'
import styles from './ConversationHome.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { openGroup } from '../../../Redux/Group/groupActions'
import {Debouncing} from '../../../Utils/Debouncing'
import { searchUsers } from '../../../Redux/Home/homeActions'

const ConversationHome = () => {
  const {allFriends, allUsers} = useSelector(state=>state.homeReducer);
  const dispatch = useDispatch();
  const debouncedSearch = useCallback(Debouncing((text) => {
    dispatch(searchUsers(text))
  }, 800), [dispatch]);

  function handleChange(e) {
    const text = e.target.value;

    debouncedSearch(text);
  }
  
  return (
    <div className={styles.main}>
      <div className={styles.heading}>
        <span>Conversations</span>
      </div>
      <div className={styles.searchBar}>
        <input onChange={handleChange}/>
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