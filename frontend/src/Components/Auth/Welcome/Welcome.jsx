import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Shield, Zap, Heart } from 'lucide-react'
import styles from './Welcome.module.scss'

const Welcome = () => {
  const { user } = useSelector(state => state.userReducer);
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/home');
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className={styles.main}>
      <div className={styles.spiderPattern} />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={styles.content}
      >
        <motion.div variants={itemVariants} className={styles.hero}>
          <div className={styles.logoBadge}>
            <span className={styles.spiderIcon}>🕸️</span>
            <h1>SPIDEY CHAT</h1>
          </div>
          <h2 className={styles.tagline}>Connected Across the <span className={styles.accent}>Multiverse</span></h2>
          <p className={styles.description}>
            Swing into the ultimate chat experience. Whether you're an OG wall-crawler, 
            a Miles Morales fan, or spinning webs with Gwen—your communication is now cinematic.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className={styles.features}>
          <div className={styles.featureItem}>
            <Zap size={24} className={styles.neonIcon} />
            <span>Instant Webs</span>
          </div>
          <div className={styles.featureItem}>
            <Shield size={24} className={styles.neonIcon} />
            <span>Spider-Security</span>
          </div>
          <div className={styles.featureItem}>
            <Heart size={24} className={styles.neonIcon} />
            <span>Versatile Suits</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className={styles.actions}>
          <button className={styles.primaryBtn} onClick={() => navigate('/login')}>
            Enter the Spider-Verse
          </button>
          <button className={styles.secondaryBtn} onClick={() => navigate('/signup')}>
            Join the Web-Heads
          </button>
        </motion.div>
      </motion.div>

      {/* Atmospheric web elements */}
      <div className={styles.webTopLeft} />
      <div className={styles.webBottomRight} />
    </div>
  )
}

export default Welcome