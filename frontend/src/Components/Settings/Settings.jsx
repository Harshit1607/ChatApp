import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Trash2, LogOut, X, Edit3, Check, User as UserIcon } from 'lucide-react'
import styles from './Settings.module.scss'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { changePhoto, deletePhoto, logout, newAboutme } from '../../Redux/User/userActions';
import { setTheme } from '../../Redux/Home/homeActions';
import mm from '../../Assets/mmCursorBig.png'
import gw from '../../Assets/gwcursorBig.png'
import og from '../../Assets/ogcursorBig.png'

const Settings = () => {
  const { user } = useSelector(state => state.userReducer);
  const { theme } = useSelector(state => state.homeReducer);

  const themeValues = [
    { name: 'og', img: og, spiderman: "Classic Spider-Man", desc: "The Legend", accent: "#d11013" },
    { name: 'mm', img: mm, spiderman: "Miles Morales", desc: "Be Greater", accent: "#c92026" },
    { name: 'gw', img: gw, spiderman: "Spider-Gwen", desc: "Different Harmony", accent: "#ee4b8d" }
  ];
  
  const [userAbout, setuserAbout] = useState(user?.about || "");
  const [edit, setEdit] = useState(false);
  const [hoverTheme, setHoverTheme] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleNewImage = (e) => {
    const file = e.target.files[0];  
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(changePhoto(reader.result, user._id));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={styles.main}
    >
      <div className={styles.overlay} onClick={() => navigate('/home')} />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className={styles.content}
      >
        <button className={styles.closeBtn} onClick={() => navigate('/home')}>
          <X size={24} />
        </button>

        <div className={styles.profileSection}>
          <div className={styles.avatarWrapper}>
            {user.profile ? (
              <img src={user.profile} alt="Pfp" className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}><UserIcon size={64} /></div>
            )}
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={styles.cameraBtn}
              onClick={() => fileInputRef.current.click()}
            >
              <Camera size={20} />
              <input ref={fileInputRef} type='file' accept="image/*" className={styles.hiddenInput} onChange={handleNewImage}/>
            </motion.button>
          </div>
          
          <div className={styles.profileHeader}>
            <h2>{user.name}</h2>
            <div className={styles.aboutWrapper}>
              {edit ? (
                <div className={styles.editAbout}>
                  <textarea 
                    maxLength={50} 
                    value={userAbout} 
                    onChange={(e) => setuserAbout(e.target.value)}
                    autoFocus
                  />
                  <button onClick={() => {
                    if (userAbout !== user.about) dispatch(newAboutme(user._id, userAbout));
                    setEdit(false);
                  }}>
                    <Check size={18} />
                  </button>
                </div>
              ) : (
                <div className={styles.viewAbout} onClick={() => setEdit(true)}>
                  <p>{userAbout || "Setting your spider-status..."}</p>
                  <Edit3 size={14} className={styles.editIcon} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.themeSection}>
          <h3>Select Your Suit</h3>
          <div className={styles.themeGrid}>
            {themeValues.map((t) => (
              <motion.div
                key={t.name}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`${styles.themeCard} ${theme === t.name ? styles.active : ''}`}
                onClick={() => dispatch(setTheme(t.name))}
                style={{ '--accent': t.accent }}
              >
                <div className={styles.themeImage}>
                  <img src={t.img} alt={t.spiderman} />
                </div>
                <div className={styles.themeInfo}>
                  <h4>{t.spiderman}</h4>
                  <p>{t.desc}</p>
                </div>
                {theme === t.name && (
                  <motion.div layoutId="activeTheme" className={styles.activeIndicator}>
                    <Check size={16} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.userStats}>
            <div className={styles.statItem}>
              <span>Email</span>
              <p>{user.email}</p>
            </div>
            <div className={styles.statItem}>
              <span>Phone</span>
              <p>{user.phone || "Not linked"}</p>
            </div>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: '#ff4444' }}
            whileTap={{ scale: 0.98 }}
            className={styles.logoutBtn}
            onClick={() => {
              dispatch(logout());
              navigate('/');
            }}
          >
            <LogOut size={20} />
            Logout
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Settings
