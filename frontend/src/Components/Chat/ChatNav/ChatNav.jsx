import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Phone, Video, X, User, MoreVertical } from 'lucide-react'
import styles from './ChatNav.module.scss'
import { useDispatch, useSelector } from 'react-redux';
import { closeChat } from '../../../Redux/Group/groupActions';
import socket from '../../../Socket/Socket';
import { makeCall, onlyAudio } from '../../../Redux/Call/callActions';
import { audioGroupCall, makeGroupCall } from '../../../Redux/GroupCall/groupcallActions';
import { useNavigate } from 'react-router-dom';
import { getPhoto, getSingleUser } from '../../../Redux/Home/homeActions';

const ChatNav = () => {
  const { groupChat } = useSelector(state => state.groupReducer);
  const { user } = useSelector(state => state.userReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [status, setStatus] = useState("")
  const [lastSeen, setLastSeen] = useState("");
  const [profile, setProfile] = useState("");

  const findName = () => {
    let name;
    groupChat.UserDetails.forEach(each => {
      if (each._id !== user._id) {
        name = each.name;
      }
    });
    return name;
  };

  useEffect(() => {
    const statusSeen = (detail) => {
      setStatus(detail.status);
      setLastSeen(detail.lastSeen);
    }
    socket.on('checkUser', statusSeen);
    return () => socket.off('checkUser');
  }, []);

  useEffect(() => {
    if (!groupChat.isGroup) {
      findProfile();
    } else {
      setProfile(groupChat.profile);
    }
  }, [groupChat]);

  const findProfile = () => {
    groupChat.UserDetails.forEach(async (each) => {
      if (each._id !== user._id) {
        const newProfile = await dispatch(getPhoto(each._id));
        setProfile(newProfile);
      }
    });
  };

  const name = !groupChat.isGroup && groupChat.name === "" ? findName() : groupChat.name;

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={styles.main}
    >
      <div className={styles.leftSection}>
        <div 
          className={styles.pfpWrapper}
          onClick={() => {
            if (groupChat.isGroup) {
              navigate('/groupProfile');
            } else {
              dispatch(getSingleUser(groupChat.Users.find(each => each !== user._id)));
              navigate("/userProfile");
            }
          }}
        >
          <div className={styles.pfpContainer}>
            {profile ? (
              <img src={profile} alt={name} className={styles.pfp} />
            ) : (
              <div className={styles.avatarPlaceholder}><User size={24} /></div>
            )}
            {!groupChat.isGroup && status === "online" && (
              <div className={styles.onlineStatus} />
            )}
          </div>
        </div>
        
        <div className={styles.info}>
          <h2 className={styles.name}>{name}</h2>
          <span className={`${styles.status} ${status === "online" ? styles.online : ''}`}>
            {groupChat.isGroup ? (
              groupChat.UserDetails.filter(u => groupChat.Users.includes(u._id.toString()))
                .map(u => u.name).join(", ").substring(0, 40) + "..."
            ) : (
              status === "online" ? "Online" : lastSeen ? `Last seen: ${lastSeen}` : "Offline"
            )}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <motion.button 
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
          whileTap={{ scale: 0.9 }}
          className={styles.actionBtn}
          onClick={() => {
            if (groupChat.isGroup) {
              dispatch(audioGroupCall());
              dispatch(makeGroupCall());
            } else {
              dispatch(onlyAudio());
              dispatch(makeCall());
            }
          }}
        >
          <Phone size={20} />
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
          whileTap={{ scale: 0.9 }}
          className={styles.actionBtn}
          onClick={() => {
            groupChat.isGroup ? dispatch(makeGroupCall()) : dispatch(makeCall())
          }}
        >
          <Video size={20} />
        </motion.button>

        <div className={styles.divider} />

        <motion.button 
          whileHover={{ scale: 1.1, color: '#ff4444' }}
          whileTap={{ scale: 0.9 }}
          className={styles.closeBtn}
          onClick={() => dispatch(closeChat())}
        >
          <X size={20} />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default ChatNav