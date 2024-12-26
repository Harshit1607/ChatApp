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
    dispatch(newChat(text, user, groupChat))
    setText("")
  }
  return (
    <div className={styles.main}>
      <input type="text" value={text} onChange={(e)=>handleInput(e)}/>
      <div onClick={handleClick}>
        {/* <img src={send} /> */}
      </div>
    </div>
  )
}

export default ChatInput