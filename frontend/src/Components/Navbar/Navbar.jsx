import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Users, User, Settings, LogOut, Shield } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../Redux/User/userActions'
import { setSidebarTab } from '../../Redux/Home/homeActions'
import styles from './Navbar.module.scss'
import spideyLogo from '../../Assets/spider.svg'

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.userReducer);
  const { activeTab } = useSelector(state => state.homeReducer);

  const navItems = [
    { icon: <MessageSquare size={24} />, tab: 'all', label: 'All Spider-Signals' },
    { icon: <User size={24} />, tab: 'direct', label: 'Private Webs' },
    { icon: <Users size={24} />, tab: 'groups', label: 'The Spider-Society' },
  ];

  const handleNav = (tab) => {
    dispatch(setSidebarTab(tab));
    if (location.pathname !== '/home') {
      navigate('/home');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <motion.nav 
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      className={styles.navbar}
    >
      <div className={styles.logoSection}>
        <motion.img 
          whileHover={{ rotate: 360, scale: 1.2 }}
          transition={{ duration: 0.8 }}
          src={spideyLogo} 
          alt="Spider Logo" 
          className={styles.logo} 
          onClick={() => navigate('/home')}
        />
      </div>

      <div className={styles.navLinks}>
        {navItems.map((item) => (
          <motion.button
            key={item.tab}
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleNav(item.tab)}
            className={`${styles.navItem} ${activeTab === item.tab && location.pathname === '/home' ? styles.active : ''}`}
            title={item.label}
          >
            {item.icon}
            <span className={styles.tooltip}>{item.label}</span>
          </motion.button>
        ))}
      </div>

      <div className={styles.bottomSection}>
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 90 }}
          onClick={() => navigate('/settings')}
          className={`${styles.navItem} ${location.pathname === '/settings' ? styles.active : ''}`}
          title="Web Settings"
        >
          <Settings size={24} />
          <span className={styles.tooltip}>Web Settings</span>
        </motion.button>

        <div className={styles.userSection}>
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className={styles.userAvatar}
            onClick={() => navigate('/settings')}
          >
            {user?.profile ? (
              <img src={user.profile} alt="Me" />
            ) : (
              <User size={20} />
            )}
          </motion.div>
          
          <motion.button 
            whileHover={{ scale: 1.1, color: 'var(--primary-color)' }}
            onClick={handleLogout}
            className={styles.logoutBtn}
            title="Log Out"
          >
            <LogOut size={22} />
          </motion.button>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar