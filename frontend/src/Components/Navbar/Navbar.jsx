import React from 'react'
import styles from './Navbar.module.scss'

const Navbar = () => {
  return (
    <div className={styles.main}>
      <div className={styles.pfp}>
        <div></div>
      </div>
      <div className={styles.setting}>
        <div></div>
      </div>
    </div>
  )
}

export default Navbar