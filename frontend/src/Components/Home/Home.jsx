import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import styles from './Home.module.scss'
import ChatHome from '../Chat/ChatHome/ChatHome'
import ConversationHome from '../Conversation/ConversationHome/ConversationHome'
import Navbar from '../Navbar/Navbar'
import { getAllFriends, getAllUsers } from '../../Redux/Home/homeActions'
import Search from '../Search/Search'
import Group from '../Group/Group'

const Home = () => {
  const { user } = useSelector(state => state.userReducer)
  const { searchUsers } = useSelector((state) => state.homeReducer);
  const { makeGroup } = useSelector((state) => state.groupReducer);
  const dispatch = useDispatch()
  useEffect(()=>{
    dispatch(getAllFriends(user));
  },[user])
  // Directly check if the user exists in Redux or localStorage
  const isAuth = user || localStorage.getItem('user')

  return (
    isAuth ? (
      <div className={styles.home}>
        <Navbar />
        <ConversationHome />
        <ChatHome />
      {searchUsers && searchUsers.length > 0 ? <Search /> : null}
      {makeGroup ? <Group/> : null}
      </div>
    ) : (
      <Navigate to="/" />
    )
  )
}

export default Home
