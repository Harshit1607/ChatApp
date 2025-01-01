import React, {useState, useEffect} from 'react'
import styles from './ChatNav.module.scss'
import { useDispatch, useSelector } from 'react-redux';
import call from '../../../Assets/call.svg'
import video from '../../../Assets/video.svg'
import cross from '../../../Assets/cross.svg'
import { closeChat } from '../../../Redux/Group/groupActions';
import socket from '../../../Socket/Socket';

const ChatNav = () => {
  const {groupChat} = useSelector(state=>state.groupReducer);
  const {user} = useSelector(state=>state.userReducer);
  const dispatch = useDispatch();

  const [status, setStatus] = useState("")
  const [lastSeen, setLastSeen] = useState("")

  const findName = () => {
    let name;
    groupChat.UserDetails.forEach(each => {
      if (each._id != user._id) {
        name = each.name;
      }
    });
    return name; // returns the found name
  };

  useEffect(()=>{

    const statusSeen = (detail)=>{
      setStatus(detail.status)
      setLastSeen(detail.lastSeen)
      console.log(status, lastSeen);
    }

   socket.on('checkUser', statusSeen) 
  })
  
  const name = !groupChat.isGroup && groupChat.name === "" ? findName() : groupChat.name;
  
;  return (
    <div className={styles.main}>
      <div className={styles.pfp}>
        <div></div>
      </div>
      <div className={styles.info}>
        <span>{name}</span>
        { groupChat.isGroup?
          <span>{groupChat.UserDetails.map(each=>each.name).join(" ").substring(0,30)}</span>
          :<span>{status==="online"? status : lastSeen ? `lastSeen: ${lastSeen}`: ""}</span>
        }
      </div>
      <div className={styles.callBox}>
        <div>
          <img src={call} alt="" />
        </div>
        <div>
          <img src={video} alt="" />
        </div>
        <div onClick={()=>{dispatch(closeChat())}}>
          <img src={cross} alt="" />
        </div>
      </div>
    </div>
  )
}

export default ChatNav