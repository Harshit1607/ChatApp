import React from 'react'
import styles from './SingleConvo.module.scss'

const SngleConvo = () => {
  return (
    <div className={styles.main}>
      <div className={styles.pfp}>
        <div></div>
      </div>
      <div className={styles.info}>
        <span>Name</span>
        <span>Message....</span>
      </div>
      <div className={styles.others}>
        <div></div>
        <span>11:11 am</span>
      </div>
    </div>
  )
}

export default SngleConvo