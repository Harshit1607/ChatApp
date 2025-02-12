import React, { useEffect, useState } from 'react'
import styles from './ChatBox.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { loadChats } from '../../../Redux/Chat/chatActions';
import SingleChat from '../SingleChat/SingleChat';
import { otherStopTyping, otherTyping, viewChat } from '../../../Socket/ChatSocket';
import spider from '../../../Assets/redSpider.svg'
import gwspider from '../../../Assets/blueSpider.svg'
import { closeTranslation, translateText } from '../../../Redux/Translation/translationActions';

const ChatBox = () => {
  const {groupChat} = useSelector(state=>state.groupReducer);
  const {user} = useSelector(state=>state.userReducer);
  const {chats, typing} = useSelector(state=>state.chatReducer);
  const {theme} = useSelector(state=>state.homeReducer);
  const {languages, isTranslating, toTranslate, translatedText} = useSelector(state=>state.translationReducer);

  const [selectedLang, setSelectedLang] = useState("");
  const [visibleChatId, setVisibleChatId] = useState(null);
  const [chatOptions, setChatOptions] = useState(null);
  
  const dispatch = useDispatch();
  useEffect(()=>{
    dispatch(loadChats(groupChat, user));
  }, [groupChat])
  useEffect(()=>{
    viewChat(groupChat._id, user._id)
  }, [chats?.length])

  const isNewDay = (currentChat, previousChat) => {
    const currentDate = new Date(currentChat.createdAt).toDateString();
    const previousDate = previousChat ? new Date(previousChat.createdAt).toDateString() : null;
    return currentDate !== previousDate;
  };
  const handleTranslateLanguage = (e)=>{
    const selectedCode = e.target.value; // Get the selected language code
    const selectedLanguage = languages.find(lang => lang.code === selectedCode); // Find the corresponding language object
    setSelectedLang(selectedLanguage); // Update the state with the language object
  }
  const submitTranslateLang = ()=>{
    dispatch(translateText(toTranslate, selectedLang.code));
  }


  return (
    <div className={styles.main}>
      <div className={styles.chatbox}>
      {groupChat && chats && chats.length > 0
          ? chats
              .filter((chat) => chat.Group[0] === groupChat._id && chat.Users.includes(user._id))
              .map((chat, index) => (
                <React.Fragment key={chat._id}>
                  <SingleChat chat={chat} visible={visibleChatId === chat._id} // Check if this chat is currently visible
                    setVisibleChatId={setVisibleChatId} index={index} chatOptions={chatOptions === chat._id}
                    setChatOptions={setChatOptions}/>
                  {isNewDay(chat, chats.filter((chat) => chat.Group[0] === groupChat._id && chat.Users.includes(user._id))[index + 1]) && (
                    <div className={styles.dateSeparator}>
                      {new Date(chat.createdAt).toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  )}
                  
                </React.Fragment>
              ))
          : null}
      </div>
      <div style={{"display": !typing? "none" : ""}} className={styles.typingIndicator}>
          <img src={theme === 'gw'? gwspider: spider} alt="" />
          <img src={theme === 'gw'? gwspider: spider} alt="" />
          <img src={theme === 'gw'? gwspider: spider} alt="" />
          <img src={theme === 'gw'? gwspider: spider} alt="" />
      </div>
      {isTranslating && languages && (
        <div className={styles.translationBox}>
          <div className={styles.cut} onClick={()=>dispatch(closeTranslation())}>X</div>
          <select
            value={selectedLang?.code || ""} // Use the code of the selected language or an empty string
            onChange={handleTranslateLanguage}
          >
            <option value="" disabled>
              Select an option
            </option>
            {languages.map((each) => (
              <option key={each.code} value={each.code}>
                {each.name}
              </option>
            ))}
          </select>
          <button onClick={submitTranslateLang}>Select</button>
        </div>
      )}
      {
        translatedText && 
        <div className={styles.translatedBox} onClick={()=>dispatch(closeTranslation())}>
          <div className={styles.cut}>X</div>
          <div>
            <span>Orignal: </span>
            <span>{toTranslate}</span>
          </div>
          <div>
            <span>{selectedLang.name}: </span>
            <span>{translatedText}</span>
          </div>
          
        </div>
      }
    </div>
  )
}

export default ChatBox