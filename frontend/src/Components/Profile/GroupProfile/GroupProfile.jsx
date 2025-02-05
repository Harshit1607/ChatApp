import React, { useEffect, useRef, useState } from 'react'
import styles from './GroupProfile.module.scss'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import options from '../../../Assets/3Dots.png'
import { changeGroupPhoto, leaveGroup, makeAdmin, newDesc } from '../../../Redux/Group/groupActions';
import pencil from '../../../Assets/pencil.svg'
import done from '../../../Assets/singleTickWhite.svg'

const GroupProfile = () => {

  const {groupChat} = useSelector(state=>state.groupReducer);
  const { user } = useSelector(state => state.userReducer);

  const [image, setImage] = useState();
  const [option, setOption] = useState(false);
  const [adminOption, setAdminOption] = useState(null);
  const [icon, setIcon] = useState(false);
  const [edit, setEdit] = useState(false);
  const [desc, setDesc] = useState(groupChat?.description)
  const adminOptionRefs = useRef({});

  const navigate = useNavigate()

  useEffect(()=>{
    if(!groupChat){
      navigate('/home')
    }
  }, [groupChat])

  useEffect(() => {
    const handleCloseAdminOption = (event) => {
      const clickedOutsideAll = Object.values(adminOptionRefs.current).every(
        (ref) => ref && !ref.contains(event.target)
      );

      if (clickedOutsideAll) {
        setAdminOption(null);
      }
    };

    document.addEventListener('click', handleCloseAdminOption);
    return () => {
      document.removeEventListener('click', handleCloseAdminOption);
    };
  }, []);
  const dispatch = useDispatch();

  const fileInputRef = useRef(null);
  const ProfileOptionRef = useRef(null);

  const showOptions = ()=>{
    setOption(!option);
  }
  const showImg = ()=>{
    setIcon(!icon);
  }

  const handleGroupDescription = (e)=>{
    const text = e.target.value;
    setDesc(text);
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

    const handleLeaveGroup = (id)=>{
      dispatch(leaveGroup(id, groupChat._id))
    }
    
    if (!groupChat) {
      return null; // or a loading spinner if necessary
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
              <textarea type="text" maxLength="200" value={desc} onChange={handleGroupDescription} disabled={!edit} />
              <span className={styles.charCount}>{`${desc.length}/200`}</span>
              {!edit ? <button className={styles.descButton} onClick={()=>{setEdit(true)}}><img src={pencil}/></button>
              : <button className={styles.descButton} onClick={()=>{
                if(desc !== groupChat.description){
                  dispatch(newDesc(groupChat._id, desc, user._id))
                }
                setEdit(false)
                }}><img src={done}/></button>}
            </div>
        </div>
        <div className={styles.leave}>
          <button onClick={()=>handleLeaveGroup(user._id, groupChat._id)}>Exit Group</button>
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
            {groupChat.UserDetails.map((each, index)=>{
                return(
                  <div className={styles.memberInfo} key={index}>
                    <div>
                      <div>{each.profile && <img src={each.profile} alt="" />}</div>
                      
                    </div>
                    <div>
                      <span>{each._id === user._id? "You":each.name}</span>
                      <span>{each.about}</span>
                    </div>
                    <div ref={(el) => (adminOptionRefs.current[each._id] = el)}>
                      {groupChat.Admin && groupChat.Admin.some(admin => admin === each._id)? <div className={styles.admin}>Group Admin</div>: null}
                      <img src={options} alt="" onClick={()=>setAdminOption((prev)=>(prev === each._id)? null : each._id)}/>

                      <div className={styles.adminOptions}  style={{'visibility': adminOption === each._id? "" : "hidden"}}>
                        {groupChat.Admin.some(admin => admin === user._id) && each._id !== user._id?
                        <>{<button onClick={()=>{dispatch(leaveGroup(user._id, groupChat._id, each._id))}} >Remove</button>}
                        <button onClick={()=>{dispatch(makeAdmin(user._id, groupChat._id, each._id))}}>Make Admin</button></>: null}
                        <button>View</button>
                      </div>
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