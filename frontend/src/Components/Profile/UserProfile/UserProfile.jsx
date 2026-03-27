import React from 'react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Phone, Video, X, User as UserIcon, Image as ImageIcon } from 'lucide-react'
import { makeCall, onlyAudio } from '../../../Redux/Call/callActions';
import Carousel from '../../../Utils/Carousel/Carousel';
import styles from './UserProfile.module.scss'

const UserProfile = () => {
  const { newUser } = useSelector(state => state.homeReducer);
  const { user } = useSelector(state => state.userReducer);
  const { chats } = useSelector(state => state.chatReducer);
  const { groupChat } = useSelector(state => state.groupReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!newUser) return null;

  const mediaChats = chats?.filter(chat => 
    chat.isMedia && 
    chat.Group[0] === groupChat?._id && 
    chat.Users.includes(user._id)
  ) || [];

  return (
    <div className={styles.main}>
      <div className={styles.overlay} onClick={() => navigate('/home')} />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className={styles.content}
      >
        <button className={styles.closeBtn} onClick={() => navigate('/home')}>
          <X size={24} />
        </button>

        <div className={styles.profileHero}>
          <div className={styles.avatarWrapper}>
            {newUser.profile ? (
              <img src={newUser.profile} alt={newUser.name} className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}><UserIcon size={64} /></div>
            )}
            <div className={styles.statusBadge} />
          </div>
          <h2 className={styles.name}>{newUser.name}</h2>
          <p className={styles.about}>{newUser.about || "Swinging through the multiverse."}</p>
        </div>

        <div className={styles.actionGrid}>
          <motion.button 
            whileHover={{ scale: 1.05, background: 'rgba(var(--primary-color), 0.2)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { dispatch(onlyAudio()); dispatch(makeCall()); }}
            className={styles.actionItem}
          >
            <Phone size={24} />
            <span>Audio Call</span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05, background: 'rgba(var(--primary-color), 0.2)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(makeCall())}
            className={styles.actionItem}
          >
            <Video size={24} />
            <span>Video Call</span>
          </motion.button>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.detailItem}>
            <span className={styles.label}>Phone Number</span>
            <p className={styles.value}>{newUser.phone || "Secret Identity"}</p>
          </div>
        </div>

        <div className={styles.mediaSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.left}>
              <ImageIcon size={20} />
              <h3>Shared Media</h3>
            </div>
            <span className={styles.count}>{mediaChats.length} Files</span>
          </div>
          
          <div className={styles.mediaGrid}>
            <Carousel length={mediaChats.length || 1}>
              {mediaChats.length > 0 ? (
                mediaChats.map((chat, idx) => (
                  <img key={idx} src={chat.message.message} alt="Shared" className={styles.mediaImg} />
                ))
              ) : (
                <div className={styles.emptyMedia}>No webs spun here yet.</div>
              )}
            </Carousel>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default UserProfile