import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { X, Users, Check, Phone } from 'lucide-react';
import { closeGroup, createGroup } from '../../Redux/Group/groupActions';
import styles from './Group.module.scss';

const Group = () => {
  const { user } = useSelector((state) => state.userReducer);
  const { makeGroup } = useSelector((state) => state.groupReducer);
  const { allUsers } = useSelector((state) => state.homeReducer);

  const [text, setText] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const dispatch = useDispatch();
  const boxRef = useRef(null);

  const handleOutsideClick = useCallback((e) => {
    if (boxRef.current && !boxRef.current.contains(e.target)) {
      dispatch(closeGroup());
    }
  }, [dispatch]);

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [handleOutsideClick]);

  const handleUserClick = (single) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u._id === single._id)
        ? prev.filter((u) => u._id !== single._id)
        : [...prev, single]
    );
  };

  const handleSubmit = () => {
    if (!text.trim()) return alert("Name your team first!");
    if (selectedUsers.length === 0) return alert("You need allies to form a team!");
    dispatch(createGroup(text, user, selectedUsers));
    dispatch(closeGroup());
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.overlay}
    >
      <motion.div 
        ref={boxRef}
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className={styles.modal}
      >
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <Users size={24} className={styles.titleIcon} />
            <h3>Assemble Team</h3>
          </div>
          <button className={styles.closeBtn} onClick={() => dispatch(closeGroup())}><X size={20} /></button>
        </div>

        <div className={styles.inputArea}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's the team called?"
          />
        </div>

        <div className={styles.userSection}>
          <p className={styles.label}>Recruit Allies ({selectedUsers.length} selected)</p>
          <div className={styles.userList}>
            {allUsers && allUsers.filter(u => u._id !== user._id).map((f) => (
              <motion.div
                key={f._id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUserClick(f)}
                className={`${styles.userItem} ${selectedUsers.some(u => u._id === f._id) ? styles.selected : ''}`}
              >
                <div className={styles.avatar}>
                  {f.profile ? <img src={f.profile} alt={f.name} /> : <div className={styles.placeholder}>{f.name[0]}</div>}
                  {selectedUsers.some(u => u._id === f._id) && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={styles.checkBadge}>
                      <Check size={12} />
                    </motion.div>
                  )}
                </div>
                <div className={styles.info}>
                  <span className={styles.name}>{f.name}</span>
                  <span className={styles.phone}><Phone size={10} /> {f.phone || "No phone"}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px var(--primary-color)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit} 
            className={styles.submitBtn}
          >
            Form Alliance
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Group;
