import React, { useRef, useState } from 'react'
import styles from './GroupProfile.module.scss'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import options from '../../../Assets/3Dots.png'
import { changeGroupPhoto } from '../../../Redux/Group/groupActions';

const GroupProfile = () => {

  const {groupChat} = useSelector(state=>state.groupReducer);
  const { user } = useSelector(state => state.userReducer);

  const [image, setImage] = useState();
  const [option, setOption] = useState(false);
  const [icon, setIcon] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const ProfileOptionRef = useRef(null);

  const showOptions = ()=>{
    setOption(!option);
  }
  const showImg = ()=>{
    setIcon(!icon);
  }
  const handleChangePhoto = ()=>{
      fileInputRef.current.click(); // Programmatically trigger the input
    }
  
    const handleNewImage = (e)=>{
      const file = e.target.files[0];  // Get the file from input
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result; // This gives the base64 encoded image
          setImage(base64Image); // Update the state with the base64 image
          dispatch(changeGroupPhoto(base64Image, groupChat._id)); // Dispatch action to update the profile photo
        };
        reader.readAsDataURL(file); // Convert image to base64 string
      }
    }

  return (
    <div className={styles.main}>
      {groupChat.profile && <div className={styles.mainImg} style={{'visibility': icon? "" : "hidden"}}><span onClick={showImg}>X</span> <img  src={groupChat.profile} alt=""  /> </div>}
      <div className={styles.left}>
        <div className={styles.info}>
            <div className={styles.profile}>
              <div onClick={showOptions}>
                {groupChat.profile && <img src={groupChat.profile} alt="" />}
                <input ref={fileInputRef} type='file'accept="image/*" onChange={handleNewImage}/>
                <div ref={ProfileOptionRef} className={styles.profileOptions} style={{'visibility': option? "" : "hidden"}}>
                  <button onClick={handleChangePhoto}>Change Photo</button>
                  <button onClick={showImg}>View Photo</button>
                </div>
              </div>
              <span>{groupChat.name}</span>
            </div>
            <div className={styles.description}>
              <span>Group Description</span>
              <textarea type="text" />
            </div>
        </div>
        <div className={styles.leave}>
          <button>Exit Group</button>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.media}>
          <span>Media</span>
          <div></div>
        </div>
        <div className={styles.members}>
          <div>
            <span>{groupChat.Users.length} Members</span>
          </div>
          <div>
            {groupChat.UserDetails.map(each=>{
                return(
                  <div className={styles.memberInfo}>
                    <div>
                      <div>{each.profile && <img src={each.profile} alt="" />}</div>
                      
                    </div>
                    <div>
                      <span>{each._id === user._id? "You":each.name}</span>
                      <span>{each.about}</span>
                    </div>
                    <div>
                      {groupChat.Admin && groupChat.Admin.some(admin => admin === user._id)? <div className={styles.admin}>Group Admin</div>: null}
                      <img src={options} alt="" />
                    </div>
                  </div>
              );
            })}
          </div>
          
        </div>
      </div>
      <div className={styles.cut} onClick={()=>navigate('/home')}>X</div>
    </div>
  )
}

export default GroupProfile