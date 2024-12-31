import React, {useCallback} from 'react'
import SingleConvo from '../SingleConvo/SngleConvo'
import styles from './ConversationHome.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import {Debouncing} from '../../../Utils/Debouncing'
import { getAllUsers, searchUsers } from '../../../Redux/Home/homeActions'
import spiderGroupBig from '../../../Assets/spiderGroupBig.svg'
import { makeGroup } from '../../../Redux/Group/groupActions'

const ConversationHome = () => {
  const {allFriends, allUsers} = useSelector(state=>state.homeReducer);
  const dispatch = useDispatch();
  
  const debouncedSearch = useCallback(Debouncing((text) => {
    dispatch(searchUsers(text))
  }, 800), [dispatch]);

  function handleChange(e) {
    const text = e.target.value;
    if(!text){
      return;
    }
    debouncedSearch(text);
  }
  const handleGroup = () =>{
    dispatch(makeGroup());
    dispatch(getAllUsers());
  }
  return (
    <div className={styles.main}>
      <div className={styles.heading}>
        <span>Conversations</span>
      </div>
      <div className={styles.searchBar}>
        <input onChange={handleChange} placeholder='Search for users..'/>
        <div onClick={handleGroup}>
          <img src={spiderGroupBig} alt="Grp" />
        </div>
      </div>
      <div className={styles.covoContainer}>
        <span>Recent Chats</span>
        {allFriends ? [...allFriends].map((single, index) => (
            <SingleConvo single={single} key={index}/>
        )): null}
      </div>
    </div>
  )
}

export default ConversationHome