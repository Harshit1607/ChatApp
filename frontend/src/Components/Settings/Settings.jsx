import React, { useRef, useState } from 'react'
import styles from './Settings.module.scss'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { changePhoto, deletePhoto, logout, newAboutme } from '../../Redux/User/userActions';
const Settings = () => {
  const { user } = useSelector(state => state.userReducer);

  const [image, setImage] = useState();
  const [userAbout, setuserAbout] = useState(user?.about);
  const [edit, setEdit] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

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
        dispatch(changePhoto(base64Image, user._id)); // Dispatch action to update the profile photo
      };
      reader.readAsDataURL(file); // Convert image to base64 string
    }
  }

  const handleLogout = ()=>{
    navigate('/');
    dispatch(logout());
  }

  const handleNewAbout = (e)=>{
    const text = e.target.value;
    setuserAbout(text);
  }

  return (
    <div className={styles.main}>
      <div className={styles.info}>
        <div className={styles.profile}>
          <div className={styles.photo}>
            {user.profile && <img src={user.profile} alt="Pfp" />}
          </div>
          <button onClick={handleChangePhoto}>Change Photo <input ref={fileInputRef} type='file'accept="image/*" onChange={handleNewImage}/></button>
          <button onClick={()=>{dispatch(deletePhoto(user._id))}}>Delete Photo</button>
        </div>
        <div className={styles.userInfo}>
          <div>
            <span>Name</span>
            <span>{user.name}</span>
          </div>
          <div>
            <span>About me</span>
            <div>
              <textarea maxLength={50} value={userAbout} onChange={handleNewAbout} disabled={!edit}/>
              {!edit ? <button onClick={()=>{setEdit(true)}}>E</button> : <button onClick={()=>{
                dispatch(newAboutme(user._id, userAbout))
                setEdit(false)}}>D</button>}
            </div>
            
          </div>
          <div>
            <span>Email</span>
            <span>{user.email}</span>
          </div>
          <div>
            <span>Phone</span>
            <span>{user.phone}</span>
          </div>
        </div>
        <div className={styles.logout}>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className={styles.themes}>
        <div className={styles.themeBox}>
          <div className={styles.theme}>
            <div><button></button></div>
          </div>
          <span></span>
          <span></span>
        </div>
        <div className={styles.themeBox}>
        <div className={styles.theme}>
            <div><button></button></div>
          </div>
          <span></span>
          <span></span>
        </div>
        <div className={styles.themeBox}>
        <div className={styles.theme}>
            <div><button></button></div>
          </div>
          <span></span>
          <span></span>
        </div>
      </div>
      <div className={styles.cut} onClick={()=>navigate('/home')}>X</div>
    </div>
  )
}

export default Settings