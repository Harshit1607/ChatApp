import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './ChatBox.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { loadChats } from '../../../Redux/Chat/chatActions';
import SingleChat from '../SingleChat/SingleChat';
import { viewChat } from '../../../Socket/ChatSocket';
import { closeTranslation, translateText } from '../../../Redux/Translation/translationActions';
import { X } from 'lucide-react'

const ChatBox = () => {
  const { groupChat } = useSelector(state => state.groupReducer);
  const { user } = useSelector(state => state.userReducer);
  const { chats, typing } = useSelector(state => state.chatReducer);
  const { theme } = useSelector(state => state.homeReducer);
  const { languages, isTranslating, toTranslate, translatedText } = useSelector(state => state.translationReducer);

  const scrollRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadChats(groupChat, user));
  }, [groupChat]);

  useEffect(() => {
    if (groupChat) {
      viewChat(groupChat._id, user._id)
    }
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chats?.length]);

  const isNewDay = (currentChat, previousChat) => {
    if (!previousChat) return true;
    const currentDate = new Date(currentChat.createdAt).toDateString();
    const previousDate = new Date(previousChat.createdAt).toDateString();
    return currentDate !== previousDate;
  };

  return (
    <div className={styles.main}>
      <div className={styles.chatScrollArea} ref={scrollRef}>
        <div className={styles.chatContent}>
          {groupChat && chats && chats.length > 0 ? (
            chats
              .filter((chat) => chat.Group[0] === groupChat._id && chat.Users.includes(user._id))
              .map((chat, index, filteredChats) => (
                <React.Fragment key={chat._id}>
                  {isNewDay(chat, filteredChats[index - 1]) && (
                    <div className={styles.dateSeparator}>
                      <span>
                        {new Date(chat.createdAt).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  <SingleChat 
                    chat={chat} 
                    index={index}
                  />
                </React.Fragment>
              ))
          ) : (
            <div className={styles.emptyChat}>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={styles.emptyIcon}
              >
                🕸️
              </motion.div>
              <p>No messages yet. Start the web!</p>
            </div>
          )}
          
          <AnimatePresence>
            {typing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={styles.typingIndicator}
              >
                <div className={styles.dots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className={styles.typingText}>Someone is swinging...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isTranslating && languages && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={styles.translationOverlay}
          >
            <div className={styles.translationModal}>
              <h3>Translate Message</h3>
              <p>"{toTranslate}"</p>
              <select onChange={(e) => {
                const lang = languages.find(l => l.code === e.target.value);
                if (lang) dispatch(translateText(toTranslate, lang.code));
              }}>
                <option value="">Select Target Language</option>
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
              <button onClick={() => dispatch(closeTranslation())}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {translatedText && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className={styles.translatedToast}
          >
            <div className={styles.toastHeader}>
              <span>Translation</span>
              <X size={16} onClick={() => dispatch(closeTranslation())} />
            </div>
            <div className={styles.toastBody}>
              <p className={styles.original}>{toTranslate}</p>
              <p className={styles.translated}>{translatedText}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChatBox