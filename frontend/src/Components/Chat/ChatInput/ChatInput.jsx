import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, Smile, Image as ImageIcon } from 'lucide-react'
import styles from './ChatInput.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { newChat } from '../../../Redux/Chat/chatActions'
import { stopTyping, typingIndi } from '../../../Socket/ChatSocket'

const ChatInput = () => {
  const { user } = useSelector(state => state.userReducer);
  const { groupChat } = useSelector(state => state.groupReducer);
  const [text, setText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleInput = (e) => {
    const value = e.target.value;
    setText(value);

    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      typingIndi(groupChat._id, user._id);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(groupChat._id, user._id);
    }, 2000);
  }

  const handleSend = () => {
    if (text.trim()) {
      dispatch(newChat(text, user._id, groupChat._id));
      setText("");
      setIsTyping(false);
      stopTyping(groupChat._id, user._id);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const handleFileClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(newChat(reader.result, user._id, groupChat._id, true));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.container}>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={styles.main}
      >
        <div className={styles.inputWrapper}>
          <motion.button 
            whileHover={{ scale: 1.1, color: 'var(--primary-color)' }}
            whileTap={{ scale: 0.9 }}
            className={styles.attachBtn}
            onClick={handleFileClick}
          >
            <Paperclip size={20} />
            <input 
              ref={fileInputRef} 
              type='file' 
              accept="image/*" 
              className={styles.hiddenInput}
              onChange={handleFileChange}
            />
          </motion.button>

          <textarea 
            rows="1"
            value={text} 
            onChange={handleInput} 
            onKeyDown={handleKeyDown} 
            placeholder='Type a message...'
            className={styles.inputField}
          />

          <motion.button 
            whileHover={{ scale: 1.1, color: 'var(--primary-color)' }}
            whileTap={{ scale: 0.9 }}
            className={styles.emojiBtn}
          >
            <Smile size={20} />
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {text.trim() ? (
            <motion.button
              key="send"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              whileHover={{ scale: 1.1, boxShadow: '0 0 15px var(--primary-color)' }}
              whileTap={{ scale: 0.9 }}
              className={styles.sendBtn}
              onClick={handleSend}
            >
              <Send size={20} />
            </motion.button>
          ) : (
            <motion.button
              key="mic"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={styles.micBtn}
            >
              <ImageIcon size={20} onClick={handleFileClick} />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default ChatInput