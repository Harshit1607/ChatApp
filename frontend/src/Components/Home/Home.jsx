import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import styles from './Home.module.scss'
import ChatHome from '../Chat/ChatHome/ChatHome'
import ConversationHome from '../Conversation/ConversationHome/ConversationHome'
import Navbar from '../Navbar/Navbar'
import { getAllFriends, getAllUsers, sortGroups } from '../../Redux/Home/homeActions'
import Search from '../Search/Search'
import Group from '../Group/Group'

const Home = () => {
  const { user } = useSelector(state => state.userReducer)
  const { searchUsers, allFriends } = useSelector((state) => state.homeReducer);
  const { makeGroup, groupChat } = useSelector((state) => state.groupReducer);
  const {chats} = useSelector(state=>state.chatReducer);
  const dispatch = useDispatch()
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(()=>{
    dispatch(getAllFriends(user));
  },[user])

  useEffect(()=>{
    if(allFriends){
      dispatch(sortGroups())
    }
  }, [user, chats?.length])

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Directly check if the user exists in Redux or localStorage
  const isAuth = user || localStorage.getItem('user')

  return (
    isAuth ? (
      <div className={styles.home}>
       {windowWidth > 1024 && (
        <>
          <Navbar />
          <ConversationHome />
          <ChatHome />
        </>
      )}
      {windowWidth <= 1024 && !groupChat && (
        <>
          <Navbar />
          <ConversationHome />
        </>
      )}
      {windowWidth <= 1024 && groupChat && <ChatHome />}
      {searchUsers && searchUsers.length > 0 ? <Search /> : null}
      {makeGroup ? <Group/> : null}
      </div>
    ) : (
      <Navigate to="/" />
    )
  )
}

export default Home
