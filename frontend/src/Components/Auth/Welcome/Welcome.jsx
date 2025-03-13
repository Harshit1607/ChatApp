import React, { useState, useEffect } from 'react'
import {useDispatch, useSelector} from 'react-redux'
import styles from './Welcome.module.scss'
import { useNavigate } from 'react-router-dom'
import spider from '../../../Assets/spiderCursor.png'

const Welcome = () => {
  const {user} = useSelector(state=>state.userReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate()

  useEffect(()=>{
    if(user){
      navigate('/home');
    }
  }, [user])

 

  return (
    <div className={styles.main}>
      <div className={styles.authContainer} >
        <div className={styles.left}>
          <span className={styles.heading}>Welcome!</span>
          <span>Swing into action with our Spider-Man themed chat app! 🕸️ Experience the ultimate web-slinging adventure with three dynamic 
            themes—OG Spider-Man, Miles Morales, and Spider-Gwen—while enjoying all the essential chat features, including personal chats, 
            group conversations, and voice & video calls. Whether you're catching up with friends or making new connections, this app brings 
            the thrill of the Spider-Verse to your fingertips. We hope you love it! If you have any feedback or suggestions, feel free to reach
             out at hbareja.07@gmail.com. Now go on, web-head—start swinging! 🕷️💬
          </span>
          <div className={styles.submit}>
            <button onClick={()=>navigate('/signup')}>Signup</button>
            <button onClick={()=>navigate('/login')}>Login</button>
          </div>
        </div>

      </div>
      <img className={styles.backimg} src={spider} />
    </div>
  )
}

export default Welcome