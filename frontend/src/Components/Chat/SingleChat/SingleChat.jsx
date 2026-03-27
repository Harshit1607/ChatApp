import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, CheckCheck, MoreVertical, Languages, Trash2, Heart } from 'lucide-react'
import styles from './SingleChat.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { getLanguages } from '../../../Redux/Translation/translationActions'
import { deleteForAll, deleteForMe } from '../../../Redux/Chat/chatActions'

const SingleChat = ({ chat, index }) => {
  const { user } = useSelector(state => state.userReducer);
  const { groupChat } = useSelector(state => state.groupReducer);
  const { theme } = useSelector(state => state.homeReducer);
  const dispatch = useDispatch();

  const [showOptions, setShowOptions] = useState(false);
  const isMe = user._id === chat.message.sentBy[0];
  const optionsRef = useRef(null);

  const formatTime = (dateInfo) => {
    const d = new Date(dateInfo);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const variants = {
    initial: { opacity: 0, x: isMe ? 20 : -20, scale: 0.9 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  };

  const isRead = chat.message.viewedBy.length === chat.Users.length;

  return (
    <motion.div 
      variants={variants}
      initial="initial"
      animate="animate"
      className={`${styles.main} ${isMe ? styles.me : styles.other}`}
    >
      {!isMe && groupChat.isGroup && (
        <span className={styles.senderName}>
          {groupChat.UserDetails.find(u => u._id === chat.message.sentBy[0])?.name}
        </span>
      )}

      <div className={styles.bubbleWrapper}>
        <motion.div 
          layout
          className={styles.bubble}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowOptions(true);
          }}
        >
          {chat.isMedia ? (
            <img src={chat.message.message} alt="Media" className={styles.mediaContent} />
          ) : (
            <p className={styles.textContent}>{chat.message.message}</p>
          )}

          <div className={styles.meta}>
            <span className={styles.time}>{formatTime(chat.createdAt)}</span>
            {isMe && (
              <span className={`${styles.tick} ${isRead ? styles.read : ''}`}>
                {isRead ? <CheckCheck size={14} /> : <Check size={14} />}
              </span>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {showOptions && (
            <motion.div 
              ref={optionsRef}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={styles.optionsMenu}
            >
              {!isMe && (
                <button onClick={() => {
                  dispatch(getLanguages(chat.message.message));
                  setShowOptions(false);
                }}>
                  <Languages size={14} /> Translate
                </button>
              )}
              <button onClick={() => {
                dispatch(deleteForMe(chat._id, user._id));
                setShowOptions(false);
              }}>
                <Trash2 size={14} /> Delete for me
              </button>
              {isMe && (
                <button 
                  className={styles.deleteAll}
                  onClick={() => {
                    dispatch(deleteForAll(chat._id, user._id));
                    setShowOptions(false);
                  }}
                >
                  <Trash2 size={14} /> Delete for all
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default SingleChat