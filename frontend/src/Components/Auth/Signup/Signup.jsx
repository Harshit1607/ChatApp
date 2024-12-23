import React, {useState} from 'react'
import {useDispatch} from 'react-redux'
import styles from './Signup.module.scss'
import { signup } from '../../../Redux/userActions'
import { useNavigate } from 'react-router-dom'

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");

  const handleEmail = (e) => {
    const text = e.target.value;
    setEmail(text);
  };

  const handleName = (e) => {
    const text = e.target.value;
    setName(text);
  };

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
    if (regex.test(email) || regex.test(name) || regex.test(phone) || regex.test(pass)) {
      alert("Enter valid details");
      return;
    }
    dispatch(signup(name, email, phone, pass));
  };

  return (
    <div className={styles.main}>
      <div className={styles.authContainer} >
        <div className={styles.left}>
          <span>Welcome</span>
          <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam mauris diam, suscipit sed erat in, luctus eleifend dolor. Aenean eu purus
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam mauris diam, suscipit sed erat in, luctus eleifend dolor. Aenean eu purus</span>
        </div>
        <div className={styles.right}>
          <div className={styles.heading}>
            <span>Sign up</span>
            <span>Already a user? <span onClick={()=>navigate('/login')}>Login instead</span></span>
          </div>
          <div className={styles.infoContainer}> 
            <input type="text" placeholder='Enter your name...' onChange={handleName} value={name}/>
            <input type="email" placeholder='Enter your email...' onChange={handleEmail} value={email}/>
            <input type="text" pattern="^\d{10}$" placeholder='Enter your phone no...' onChange={handlePhone} value={phone}/>
            <input type="text" placeholder='Enter your password...' onChange={handlePass} value={pass}/>
          </div>
          <div className={styles.submit}>
            <button onClick={handleContinue}>Signup</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup