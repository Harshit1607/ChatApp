import React from 'react'
import styles from './SingleConvo.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { openGroup } from '../../../Redux/Group/groupActions'

const SngleConvo = ({single}) => {
  const {user} = useSelector(state=>state.userReducer);
  const dispatch = useDispatch();
  const findName = () => {
    let name;
    single.UserDetails.forEach(each => {
      if (each._id != user._id) {
        name = each.name;
      }
    });
    return name; // returns the found name
  };
  
  const name = !single.isGroup && single.name === "" ? findName() : single.name;
  const handleClick = () =>{

    dispatch(openGroup(user, null, single));
  }
  return (
    <div className={styles.main} onClick={handleClick}>
      <div className={styles.pfp}>
        <div></div>
      </div>
      <div className={styles.info}>
        <span>{name}</span>
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