import React, { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search as SearchIcon, Users, Plus, MessageSquare } from 'lucide-react'
import SingleConvo from '../SingleConvo/SngleConvo'
import styles from './ConversationHome.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { Debouncing } from '../../../Utils/Debouncing'
import { getAllUsers, searchUsers, closeSearch, setSidebarTab } from '../../../Redux/Home/homeActions'
import { makeGroup } from '../../../Redux/Group/groupActions'

const ConversationHome = () => {
  const { allFriends, activeTab } = useSelector(state => state.homeReducer);
  const dispatch = useDispatch();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const debouncedSearch = useCallback(Debouncing((text) => {
    dispatch(searchUsers(text))
  }, 800), [dispatch]);

  function handleChange(e) {
    const text = e.target.value;
    if (!text) {
      dispatch(closeSearch()); // Clear the overlay
      return;
    }
    debouncedSearch(text);
  }

  const handleGroup = () => {
    dispatch(makeGroup());
    dispatch(getAllUsers());
  }

  const filteredFriends = allFriends ? allFriends.filter(f => {
    if (activeTab === 'direct') return !f.isGroup;
    if (activeTab === 'groups') return f.isGroup;
    return true;
  }) : [];

  const handleTabClick = (tab) => {
    dispatch(setSidebarTab(tab));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={styles.main}
    >
      <div className={styles.header}>
        <h1 className="spidey-font">Spider-Signals</h1>
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className={styles.addBtn}
          onClick={handleGroup}
          title="Create Alliance"
        >
          <Plus size={24} />
        </motion.button>
      </div>

      <div className={`${styles.searchWrapper} ${isSearchFocused ? styles.focused : ''}`}>
        <SearchIcon size={18} className={styles.searchIcon} />
        <input 
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          onChange={handleChange} 
          placeholder='Scan the Multiverse...'
          className={styles.searchInput}
        />
      </div>

      <div className={styles.categoryTabs}>
        <div 
          className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
          onClick={() => handleTabClick('all')}
        >
          <span>All</span>
        </div>
        <div 
          className={`${styles.tab} ${activeTab === 'direct' ? styles.active : ''}`}
          onClick={() => handleTabClick('direct')}
        >
          <MessageSquare size={16} />
          <span>Private</span>
        </div>
        <div 
          className={`${styles.tab} ${activeTab === 'groups' ? styles.active : ''}`}
          onClick={() => handleTabClick('groups')}
        >
          <Users size={16} />
          <span>Society</span>
        </div>
      </div>

      <div className={styles.convoContainer}>
        <div className={styles.sectionTitle}>
          {activeTab === 'all' ? 'Multiverse Streams' : (activeTab === 'direct' ? 'Private Webs' : 'Spider-Society')}
        </div>
        <AnimatePresence mode='popLayout'>
          {filteredFriends.map((single, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              key={single._id || index}
            >
              <SingleConvo single={single} />
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredFriends.length === 0 && (
          <div className={styles.emptyState}>No spider-signals found in this dimension.</div>
        )}
      </div>
    </motion.div>
  )
}

export default ConversationHome