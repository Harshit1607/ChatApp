import React from 'react'
import styles from './Navbar.module.scss'
import web from '../../Assets/web.svg'
import spiderWeb from '../../Assets/Settings.svg'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'



const Navbar = () => {
  const {user} = useSelector(state=>state.userReducer);
  const navigate = useNavigate();
  return (
    <div className={styles.main}>
      <div className={styles.pfp}>
        <img src={web} alt="" />
        <div>
          {user.profile && <img src={user.profile} alt=''/>}
        </div>
      </div>
      <div className={styles.mid}>
        
      </div>
      <div className={styles.setting}>
        <div>
          <img src={spiderWeb} alt="" onClick={()=>{navigate('/settings')}}/>
        </div>
      </div>
    </div>
  )
}

export default Navbar