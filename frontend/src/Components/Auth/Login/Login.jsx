import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login } from '../../../Redux/User/userActions'
import styles from './Login.module.scss'

const Login = () => {
    const { user } = useSelector(state => state.userReducer);
    const [credentials, setCredentials] = useState({ email: "", password: "" })
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/home');
    }, [user]);

    const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });

    const handleLogin = (e) => {
        e.preventDefault();
        dispatch(login(credentials.email, credentials.password));
    }

    return (
        <div className={styles.main}>
            <div className={styles.spiderPattern} />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={styles.authContainer}
            >
                <div className={styles.left}>
                    <motion.h2 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Swing Back In!
                    </motion.h2>
                    <p>The Multiverse is waiting. Connect with your team and start swinging through the chat web.</p>
                    <div className={styles.floatingIcon}>🕸️</div>
                </div>

                <div className={styles.right}>
                    <div className={styles.heading}>
                        <h3>Login</h3>
                        <p>Don't have an account? <span className={styles.link} onClick={() => navigate('/signup')}>Join the web</span></p>
                    </div>

                    <form className={styles.infoContainer} onSubmit={handleLogin}>
                        <div className={styles.inputGroup}>
                            <input 
                                type="email" 
                                name="email"
                                value={credentials.email} 
                                onChange={handleChange} 
                                placeholder='Email Address'
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <input 
                                type="password" 
                                name="password"
                                value={credentials.password} 
                                onChange={handleChange} 
                                placeholder='Password'
                                required
                            />
                        </div>
                        
                        <div className={styles.submit}>
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                            >
                                Spider-Login
                            </motion.button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}

export default Login