import React from 'react'
import styles from './Navbar.module.scss'
import web from '../../Assets/web.svg'
import spiderWeb from '../../Assets/spiderWeb.svg'


const Navbar = () => {
  return (
    <div className={styles.main}>
      <div className={styles.pfp}>
        <img src={web} alt="" />
        <div></div>
      </div>
      <div className={styles.mid}>
        
      </div>
      <div className={styles.setting}>
        <div>
          <img src={spiderWeb} alt="" />
        </div>
      </div>
    </div>
  )
}

export default Navbar