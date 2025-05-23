import React, {useState, useEffect} from 'react'
import styles from './ChatNav.module.scss'
import { useDispatch, useSelector } from 'react-redux';
import call from '../../../Assets/call.svg'
import video from '../../../Assets/video.svg'
import cross from '../../../Assets/cross.svg'
import { closeChat } from '../../../Redux/Group/groupActions';
import socket from '../../../Socket/Socket';
import { makeCall, onlyAudio } from '../../../Redux/Call/callActions';
import { audioGroupCall, makeGroupCall } from '../../../Redux/GroupCall/groupcallActions';
import { useNavigate } from 'react-router-dom';
import { getPhoto, getSingleUser } from '../../../Redux/Home/homeActions';


const ChatNav = () => {
  const {groupChat} = useSelector(state=>state.groupReducer);
  const {user} = useSelector(state=>state.userReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate()

  const [status, setStatus] = useState("")
  const [lastSeen, setLastSeen] = useState("");
  const [profile, setProfile] = useState("");
  

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
    }

   socket.on('checkUser', statusSeen) 

   return ()=>{
    socket.off('checkUser');
   }
  })

  useEffect(()=>{
        if(!groupChat.isGroup){
          findProfile();
        }else{
          setProfile(groupChat.profile);
        }
    }, [groupChat])
    const findProfile = () => {
      groupChat.UserDetails.forEach(async (each) => {
        if (each._id != user._id) {
          const newProfile = await dispatch(getPhoto(each._id));
          setProfile(newProfile);
        }
      });
      
    };

  
  
  const name = !groupChat.isGroup && groupChat.name === "" ? findName() : groupChat.name;
  
;  return (

    <>
      <div className={styles.main}>
        <div className={styles.pfp}>
          <div onClick={() => {
            if (groupChat.isGroup) {
              navigate('/groupProfile');
            } else {
              dispatch(getSingleUser(groupChat.Users.find(each=>each !== user._id)));
              navigate("/userProfile");
            }
          }}>
            {profile && <img src={profile} alt=''/>}
          </div>
        </div>
        <div className={styles.info}>
          <span>{name}</span>
          { groupChat.isGroup?
            <span>{groupChat.UserDetails.filter(user => groupChat.Users.includes(user._id.toString())).map(each=>each.name).join(" ").substring(0,30)}</span>
            :<span>{status==="online"? status : lastSeen ? `lastSeen: ${lastSeen}`: ""}</span>
          }
        </div>
        <div className={styles.callBox}>
          <div onClick={() => {
              if (groupChat.isGroup) {
                dispatch(audioGroupCall());
                dispatch(makeGroupCall());
              } else {
                dispatch(onlyAudio());
                dispatch(makeCall());
              }
          }}>
            <img src={call} alt="" />
          </div>
          <div onClick={()=>{groupChat.isGroup? dispatch(makeGroupCall()) :dispatch(makeCall())}}>
            <img src={video} alt="" />
          </div>
          <div onClick={()=>{dispatch(closeChat())}}>
            <img src={cross} alt="" />
          </div>
        </div>
      </div>
    </>
  )
}

export default ChatNav