import React, { useState } from 'react'
import {useDispatch} from 'react-redux'
import styles from './Login.module.scss'
import { login } from '../../../Redux/User/userActions'
import { useNavigate } from 'react-router-dom'
import spider from '../../../Assets/spiderMan1.png'
import spiderSmall from '../../../Assets/spiderCursor.png'

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate()

  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");

  const handlePass = (e) => {
    const text = e.target.value;
    setPass(text);
  };

  const handlePhone = (e) => {
    const text = e.target.value;
    setPhone(text);
  };

  const handleContinue = () => {
    const regex = /^$/;
    if (regex.test(phone) || regex.test(pass)) {
      alert("Enter valid details");
      return;
    }
    dispatch(login(phone, pass));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleContinue(); // Trigger handleContinue when Enter is pressed
    }
  };

  return (
    <div className={styles.main} onKeyDown={handleKeyDown} tabIndex="0">
      <div className={styles.authContainer} >
        <div className={styles.left}>
          <img src={spiderSmall} />
        </div>
        <div className={styles.right}>
          <div className={styles.heading}>
            <span>Login</span>
            <span>New user? <span onClick={()=>navigate('/signup')}>Signup instead</span></span>
          </div>
          <div className={styles.infoContainer}>
            <input type="text" placeholder='Enter your phone no...' onChange={handlePhone} value={phone}/>
            <input type="password" placeholder='Enter your password...' onChange={handlePass} value={pass}/>
          </div>
          <div className={styles.submit}>
            <button onClick={handleContinue}>Login</button>
          </div>
        </div>
      </div>
      <img className={styles.backimg} src={spider} />
    </div>
  )
}

export default Login