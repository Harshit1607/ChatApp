import React from 'react'
import styles from './SingleConvo.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { openGroup } from '../../../Redux/Group/groupActions'

const SngleConvo = ({single}) => {
  const {user} = useSelector(state=>state.userReducer);
  const dispatch = useDispatch();
  const handleClick = () =>{
    
    dispatch(openGroup(user, null, single));
  }
  return (
    <div className={styles.main} onClick={handleClick}>
      <div className={styles.pfp}>
        <div></div>
      </div>
      <div className={styles.info}>
        <span>{single.name}</span>
        <span>Message....</span>
      </div>
      <div className={styles.others}>
        <div></div>
        <span>11:11 am</span>
      </div>
    </div>
  )
}

export default SngleConvo