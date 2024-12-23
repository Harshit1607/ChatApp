import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import styles from './Home.module.scss'
import ChatHome from '../Chat/ChatHome/ChatHome'
import ConversationHome from '../Conversation/ConversationHome/ConversationHome'
import Navbar from '../Navbar/Navbar'

const Home = () => {
  const { user } = useSelector(state => state.userReducer)

  // Directly check if the user exists in Redux or localStorage
  const isAuth = user || localStorage.getItem('user')

  return (
    isAuth ? (
      <div className={styles.home}>
        <Navbar />
        <ConversationHome />
        <ChatHome />
      </div>
    ) : (
      <Navigate to="/login" />
    )
  )
}

export default Home
