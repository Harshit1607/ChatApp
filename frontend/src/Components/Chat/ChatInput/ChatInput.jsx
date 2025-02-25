import React, { useRef, useState } from 'react'
import styles from './ChatInput.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { newChat } from '../../../Redux/Chat/chatActions'
import send from '../../../Assets/send.svg'
import { Debouncing } from '../../../Utils/Debouncing'
import { stopTyping, typingIndi } from '../../../Socket/ChatSocket'
import sendGw from '../../../Assets/sendGw.svg'
import attachDark from '../../../Assets/attachDark.svg'
import attachLight from '../../../Assets/attachLight.svg'


const ChatInput = () => {
  const {user} = useSelector(state=>state.userReducer);
  const {groupChat} = useSelector(state=>state.groupReducer);
  const {theme} = useSelector(state=>state.homeReducer);
  const [text, setText] = useState("")
  const [typing, setTyping] = useState(false)
  const dispatch = useDispatch();

  const fileInputRef = useRef(null);

  const handleInput = (e)=>{
    const value = e.target.value
    setText(value)

    
    
    if(!typing){
      setTyping(true);
      // call socket.emit(typing) here
      typingIndi(groupChat._id, user._id)
    }
    const debouncedStopTyping = Debouncing(() => {
      setTyping(false); // Update typing state
      stopTyping(groupChat._id, user._id); // Emit 'stop typing' event
    }, 3000); // Shortened timeout to 2000ms (2 seconds)
  
    // Call debounced function
    debouncedStopTyping();
  }

  const handleClick = ()=>{
    if (text.trim()) { // Prevent sending an empty message
      dispatch(newChat(text, user._id, groupChat._id));
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

  const handleChangePhoto = ()=>{
      fileInputRef.current.click(); // Programmatically trigger the input
    }
  
    const handleNewImage = (e) => {
      const file = e.target.files[0];  
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result; // Base64 encoded image
          // Send image to backend
          dispatch(newChat(base64Image, user._id, groupChat._id, true));
        };
        reader.readAsDataURL(file); // Convert image to base64
      }
    };

  
  return (
    <div className={styles.main}>
      <input type="text" value={text} onChange={(e)=>handleInput(e)} onKeyDown={handleKeyDown} placeholder='Enter you message...'/>
      <div onClick={handleChangePhoto}>
        <input ref={fileInputRef} type='file'accept="image/*" onChange={handleNewImage}/>
        <img src={theme === 'gw'? attachDark:attachLight}/>
      </div>
      <div onClick={handleClick}>
        <img src={theme === 'gw'? sendGw:send} />
      </div>
    </div>
  )
}

export default ChatInput