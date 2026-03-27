import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Camera, X, Trash2, Edit2, Check, LogOut, User as UserIcon, MoreVertical, Shield } from 'lucide-react'
import { changeGroupPhoto, deleteGroupPhoto, leaveGroup, makeAdmin, newDesc } from '../../../Redux/Group/groupActions';
import { getSingleUser } from '../../../Redux/Home/homeActions';
import Carousel from '../../../Utils/Carousel/Carousel';
import styles from './GroupProfile.module.scss'

const GroupProfile = () => {
  const { groupChat } = useSelector(state => state.groupReducer);
  const { user } = useSelector(state => state.userReducer);
  const { chats } = useSelector(state => state.chatReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [desc, setDesc] = useState(groupChat?.description || "");
  const [isEditing, setIsEditing] = useState(false);
  const [adminMenu, setAdminMenu] = useState(null);
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!groupChat) navigate('/home');
  }, [groupChat, navigate]);

  if (!groupChat) return null;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(changeGroupPhoto(reader.result, groupChat._id));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDescSave = () => {
    if (desc !== groupChat.description) {
      dispatch(newDesc(groupChat._id, desc, user._id));
    }
    setIsEditing(false);
  };

  const mediaChats = chats?.filter(chat => 
    chat.isMedia && 
    chat.Group[0] === groupChat._id && 
    chat.Users.includes(user._id)
  ) || [];

  const members = groupChat.UserDetails.filter(u => groupChat.Users.includes(u._id));

  return (
    <div className={styles.main}>
      <div className={styles.overlay} onClick={() => navigate('/home')} />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={styles.content}
      >
        <button className={styles.closeBtn} onClick={() => navigate('/home')}><X size={24} /></button>

        <div className={styles.topSection}>
          <div className={styles.profileBox}>
            <div className={styles.avatarContainer}>
              {groupChat.profile ? (
                <img src={groupChat.profile} alt={groupChat.name} className={styles.avatar} onClick={() => setShowFullPhoto(true)} />
              ) : (
                <div className={styles.placeholder}><UserIcon size={48} /></div>
              )}
              <button className={styles.cameraBtn} onClick={() => fileInputRef.current.click()}><Camera size={18} /></button>
              <input ref={fileInputRef} type="file" hidden onChange={handlePhotoChange} accept="image/*" />
            </div>
            <h2 className={styles.groupName}>{groupChat.name}</h2>
            <div className={styles.adminBadges}>
              {groupChat.Admin.map(adminId => (
                <span key={adminId} className={styles.badge}>
                  <Shield size={12} /> Admin
                </span>
              ))}
            </div>
          </div>

          <div className={styles.descriptionBox}>
            <div className={styles.boxHeader}>
              <h3>Description</h3>
              {isEditing ? (
                <Check size={18} className={styles.saveIcon} onClick={handleDescSave} />
              ) : (
                <Edit2 size={18} className={styles.editIcon} onClick={() => setIsEditing(true)} />
              )}
            </div>
            <textarea 
              disabled={!isEditing} 
              value={desc} 
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What's this group about?"
              maxLength="200"
            />
            <span className={styles.charCount}>{desc.length}/200</span>
          </div>
        </div>

        <div className={styles.tabsSection}>
          <div className={styles.mediaContainer}>
            <div className={styles.header}>
              <h3>Gallery</h3>
              <span>{mediaChats.length} files</span>
            </div>
            <div className={styles.carouselWrapper}>
              <Carousel length={mediaChats.length || 1}>
                {mediaChats.length > 0 ? (
                  mediaChats.map((c, i) => <img key={i} src={c.message.message} alt="" className={styles.mediaItem} />)
                ) : (
                  <div className={styles.emptyGallery}>No media yet.</div>
                )}
              </Carousel>
            </div>
          </div>

          <div className={styles.memberContainer}>
            <div className={styles.header}>
              <h3>Allies ({members.length})</h3>
            </div>
            <div className={styles.memberList}>
              {members.map((m) => (
                <div key={m._id} className={styles.memberItem}>
                  <div className={styles.mAvatar}>
                    {m.profile ? <img src={m.profile} alt="" /> : <div className={styles.mPlaceholder}>{m.name[0]}</div>}
                  </div>
                  <div className={styles.mInfo}>
                    <p className={styles.mName}>{m._id === user._id ? "You" : m.name}</p>
                    <p className={styles.mAbout}>{m.about}</p>
                  </div>
                  <div className={styles.mActions}>
                    <MoreVertical size={20} className={styles.moreIcon} onClick={() => setAdminMenu(adminMenu === m._id ? null : m._id)} />
                    <AnimatePresence>
                      {adminMenu === m._id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, x: -20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={styles.dropdown}
                        >
                          <button onClick={() => {
                            if (m._id === user._id) navigate('/settings');
                            else { dispatch(getSingleUser(m._id)); navigate('/userProfile'); }
                          }}>View Identity</button>
                          
                          {groupChat.Admin.includes(user._id) && m._id !== user._id && (
                            <>
                              <button onClick={() => dispatch(makeAdmin(user._id, groupChat._id, m._id))}>
                                {groupChat.Admin.includes(m._id) ? "Revoke Admin" : "Make Admin"}
                              </button>
                              <button className={styles.remove} onClick={() => dispatch(leaveGroup(m._id, groupChat._id))}>Remove from Team</button>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.leaveBtn} onClick={() => dispatch(leaveGroup(user._id, groupChat._id))}>
            <LogOut size={20} /> Leave Group
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showFullPhoto && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={styles.fullPhotoOverlay}
            onClick={() => setShowFullPhoto(false)}
          >
            <img src={groupChat.profile} alt="" />
            <div className={styles.photoControls}>
              <button onClick={() => fileInputRef.current.click()}>Update</button>
              <button onClick={() => dispatch(deleteGroupPhoto(groupChat._id))}>Remove</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GroupProfile