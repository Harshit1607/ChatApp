import React, { useRef, useState } from 'react'
import styles from './GroupProfile.module.scss'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const GroupProfile = () => {

  const {groupChat} = useSelector(state=>state.groupReducer);
  const { user } = useSelector(state => state.userReducer);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className={styles.main}>
      <div className={styles.left}>
        <div className={styles.info}>
            <div className={styles.profile}>
              <div></div>
              <span>{groupChat.name}</span>
            </div>
            <div className={styles.description}>
              <span>Group Description</span>
            </div>
        </div>
        <div className={styles.leave}>
          <button><img src=''/> Exit Group</button>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.media}>
          <span>Media</span>
          <div></div>
        </div>
        <div className={styles.members}>
          <div>
            <span>{groupChat.Users.length} Members</span>
          </div>
          <div>
            {groupChat.UserDetails.map(each=>{
                return(
                  <div className={styles.memberInfo}>
                    <div>
                      <div>{each.profile && <img src={each.profile} alt="" />}</div>
                      
                    </div>
                    <div>
                      <span>{each._id === user._id? "You":each.name}</span>
                      <span>{each.about}</span>
                    </div>
                    <div>
                      <img src="" alt="" />
                    </div>
                  </div>
              );
            })}
          </div>
          
        </div>
      </div>
      <div className={styles.cut} onClick={()=>navigate('/home')}>X</div>
    </div>
  )
}

export default GroupProfile