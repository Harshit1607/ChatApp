import React, { useState } from 'react'
import {useDispatch} from 'react-redux'
import styles from './Welcome.module.scss'
import { useNavigate } from 'react-router-dom'
import spider from '../../../Assets/spiderCursor.png'

const Welcome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate()

 

  return (
    <div className={styles.main}>
      <div className={styles.authContainer} >
        <div className={styles.left}>
          <span className={styles.heading}>Welcome!</span>
          <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam mauris diam, suscipit sed erat in, luctus eleifend dolor. Aenean eu purus
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam mauris diam, suscipit sed erat in, luctus eleifend dolor. Aenean eu purus
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam mauris diam, suscipit sed erat in, luctus eleifend dolor. Aenean eu purus
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam mauris diam, suscipit sed erat in, luctus eleifend dolor. Aenean eu purus
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