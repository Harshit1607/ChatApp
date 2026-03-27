import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { X, UserPlus, Phone } from 'lucide-react';
import styles from './Search.module.scss';
import { closeSearch } from '../../Redux/Home/homeActions';
import { openGroup } from '../../Redux/Group/groupActions';

const Search = () => {
  const { searchUsers } = useSelector((state) => state.homeReducer);
  const { user } = useSelector(state => state.userReducer);
  const dispatch = useDispatch();
  const boxRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        dispatch(closeSearch());
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dispatch]);

  const handleSelect = (single) => {
    dispatch(openGroup(user, single));
    dispatch(closeSearch());
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.overlay}
    >
      <motion.div 
        ref={boxRef}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className={styles.modal}
      >
        <div className={styles.header}>
          <h3>Search Results</h3>
          <button onClick={() => dispatch(closeSearch())}><X size={20} /></button>
        </div>

        <div className={styles.list}>
          {searchUsers.filter(s => s._id !== user._id).map((s, i) => (
            <motion.div 
              key={s._id}
              whileHover={{ x: 10, background: 'rgba(255, 255, 255, 0.05)' }}
              onClick={() => handleSelect(s)}
              className={styles.item}
            >
              <div className={styles.avatar}>
                {s.profile ? <img src={s.profile} alt={s.name} /> : <div className={styles.placeholder}>{s.name[0]}</div>}
              </div>
              <div className={styles.info}>
                <span className={styles.name}>{s.name}</span>
                <span className={styles.phone}><Phone size={12} /> {s.phone || "No phone"}</span>
              </div>
              <button className={styles.addBtn}><UserPlus size={18} /></button>
            </motion.div>
          ))}
          {searchUsers.filter(s => s._id !== user._id).length === 0 && (
            <div className={styles.empty}>No other web-heads found.</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Search;
