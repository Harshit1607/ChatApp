import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import styles from './SingleConvo.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { openGroup } from '../../../Redux/Group/groupActions'
import { getLatestChat } from '../../../Socket/ChatSocket'
import { leaveGroup } from '../../../Socket/GroupSocket'
import { getPhoto } from '../../../Redux/Home/homeActions'
import { User, MessageCircle } from 'lucide-react'

const SngleConvo = ({ single }) => {
  const { user } = useSelector(state => state.userReducer);
  const { groupChat } = useSelector(state => state.groupReducer);
  const { chats } = useSelector(state => state.chatReducer);
  const { latestChat, theme } = useSelector(state => state.homeReducer);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState("");
  
  const dispatch = useDispatch();

  const findName = () => {
    let name;
    single.UserDetails.forEach(each => {
      if (each._id !== user._id) {
        name = each.name;
      }
    });
    return name;
  };

  useEffect(() => {
    if (!profile) {
      if (!single.isGroup) {
        findProfile();
      } else {
        setProfile(single.profile);
      }
    }
  }, []);

  const findProfile = () => {
    single.UserDetails.forEach(async (each) => {
      if (each._id !== user._id) {
        const newProfile = await dispatch(getPhoto(each._id));
        setProfile(newProfile);
      }
    });
  };

  useEffect(() => {
    getLatestChat(single._id);
  }, [chats?.length]);

  useEffect(() => {
    if (latestChat.length > 0) {
      const newChat = latestChat.find(each => each.Group[0] === single._id);
      if (newChat) {
        setMessage(newChat);
      }
    }
  }, [latestChat]);

  const sentBy = (id) => {
    const sent = single.UserDetails.find(each => each._id === id);
    return sent ? sent.name : undefined;
  }

  const name = !single.isGroup && single.name === "" ? findName() : single.name;
  
  const isActive = groupChat?._id === single._id;

  const handleClick = () => {
    if (groupChat) {
      leaveGroup(groupChat._id)
    }
    dispatch(openGroup(user, null, single));
  }

  const formatDateTime = (timestamp) => {
    const dateObj = new Date(timestamp);
    const now = new Date();
    const elapsed = now - dateObj;
    const oneDay = 24 * 60 * 60 * 1000;

    if (elapsed > oneDay) {
      return dateObj.toLocaleDateString(undefined, {
        day: '2-digit',
        month: '2-digit'
      });
    } else {
      return dateObj.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const isUnread = message && !message.message.viewedBy.includes(user._id) && (groupChat ? (message.Group !== groupChat._id) : true);

  return (
    <motion.div 
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      className={`${styles.main} ${isActive ? styles.active : ''}`} 
      onClick={handleClick} 
    >
      <div className={styles.pfpWrapper}>
        <div className={styles.pfpContainer}>
          {profile ? (
            <img src={profile} alt={name} className={styles.pfp} />
          ) : (
            <div className={styles.avatarPlaceholder}><User size={20} /></div>
          )}
        </div>
        {isUnread && (
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className={styles.unreadBadge}
          />
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.topInfo}>
          <span className={styles.name}>{name}</span>
          <span className={styles.time}>
            {message && message.createdAt ? formatDateTime(message.createdAt) : ""}
          </span>
        </div>
        <div className={styles.bottomInfo}>
          <span className={styles.preview}>
            {message ? (
              <>
                <span className={styles.sender}>
                  {message.message.sentBy[0] === user._id ? "You" : (single.isGroup ? sentBy(message.message.sentBy[0]) : name)}
                </span>: {message.isMedia ? "Sent an image" : message.message.message}
              </>
            ) : "No messages yet"}
          </span>
          {isUnread && <MessageCircle size={14} className={styles.unreadIcon} />}
        </div>
      </div>
    </motion.div>
  )
}

export default SngleConvo