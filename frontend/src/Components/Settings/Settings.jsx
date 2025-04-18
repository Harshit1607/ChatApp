import React, { useEffect, useRef, useState, useCallback } from 'react'
import styles from './Settings.module.scss'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { changePhoto, deletePhoto, logout, newAboutme } from '../../Redux/User/userActions';
import { setTheme } from '../../Redux/Home/homeActions';
import mm from '../../Assets/mmCursorBig.png'
import gw from '../../Assets/gwcursorBig.png'
import og from '../../Assets/ogcursorBig.png'
import pencil from '../../Assets/pencil.svg'
import done from '../../Assets/singleTickWhite.svg'

const Settings = () => {
  const { user } = useSelector(state => state.userReducer);
  const {theme } = useSelector(state=>state.homeReducer);

  const themeValues = [{name: 'mm', bc: "radial-gradient(at center, #9D1F13,#090909 )", img: mm, spiderman: "Miles Morales", desc: "Red And Black"}
                      ,{name: 'og', bc: "radial-gradient(at center, #9F0707,#03022A,#010011 )", img: og, spiderman: "Spiderman", desc: "Red And Blue"}, 
                      {name: 'gw', bc: "radial-gradient(at center, #E26BA5,#FEFEFE )", img: gw, spiderman: "Gwen", desc: "Pink And White"}]
  
  const [userAbout, setuserAbout] = useState(user?.about);
  const [edit, setEdit] = useState(false);
  const [preview, setPreview] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);

  const handleOutsideClick = useCallback(
      (event) => {
        if (previewRef.current && !previewRef.current.contains(event.target)) {
          setPreview(null);
        }
      },
      [dispatch]
    );

  useEffect(()=>{
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [handleOutsideClick])

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
        dispatch(changePhoto(base64Image, user._id));
      };
      reader.readAsDataURL(file); // Convert image to base64
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

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
          <div>
            <button onClick={handleChangePhoto}>Change Photo <input ref={fileInputRef} type='file'accept="image/*" onChange={handleNewImage}/></button>
            <button onClick={()=>{dispatch(deletePhoto(user._id))}}>Delete Photo</button>
          </div>
          
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
              <span className={styles.charCount}>{`${userAbout.length}/50`}</span>
              {!edit ? <button onClick={()=>{setEdit(true)}}><img src={pencil}/></button> : <button onClick={()=>{
                if(userAbout !== user.about){
                  dispatch(newAboutme(user._id, userAbout))
                } 
                setEdit(false)}}><img src={done}/></button>}
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
          {themeValues.map(each=>{
            return(
              <div className={styles.themeBox} >
                <div className={styles.theme} style={{
                  background: `url(${each.img})`,
                  backgroundSize: "none",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }} onClick={() => {
                    setPreview(each.bc);
                }}>
                  <div><button style={{background: each.bc}} onClick={(e)=>{
                    e.stopPropagation()
                      if (theme !== each.name) {  
                        dispatch(setTheme(each.name))
                      }
                      setPreview(null)
                      
                    }}></button></div>
                </div>
                <span>{each.spiderman}</span>
                <span>{each.desc}</span>
              </div>
            )
          })}
      </div>
      <div className={styles.cut} onClick={()=>navigate('/home')}>X</div>
      {preview && <div className={styles.preview} ref={previewRef} style={{background: preview}} ></div>}
    </div>
  )
}

export default Settings