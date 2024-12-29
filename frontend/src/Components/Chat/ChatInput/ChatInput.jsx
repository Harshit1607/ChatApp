import React, { useState } from 'react'
import styles from './ChatInput.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { newChat } from '../../../Redux/Chat/chatActions'
import send from '../../../Assets/send.svg'

const ChatInput = () => {
  const {user} = useSelector(state=>state.userReducer);
  const {groupChat} = useSelector(state=>state.groupReducer);
  const [text, setText] = useState("")
  const dispatch = useDispatch();
  const handleInput = (e)=>{
    const value = e.target.value
    setText(value)
  }

  const handleClick = ()=>{
    if (text.trim()) { // Prevent sending an empty message
      dispatch(newChat(text, user, groupChat));
      setText(""); // Clear the input after sending
    }
  }

  const handleKeyDown = (e) =>{
    if (e.key === "Enter" && !e.shiftKey) { // If Enter is pressed without Shift
      e.preventDefault(); // Prevent form submission or newline
      handleClick(); // Trigger handleClick function
    } else if (e.key === "Enter" && e.shiftKey) { // If Shift + Enter is pressed
      // Allow newline
      setText(prev => prev + '\n'); // Add a newline to the text
    }
  }

  
  return (
    <div className={styles.main}>
      <input type="text" value={text} onChange={(e)=>handleInput(e)} onKeyDown={handleKeyDown} placeholder='Enter you message...'/>
      <div onClick={handleClick}>
        <img src={send} />
      </div>
    </div>
  )
}

export default ChatInput