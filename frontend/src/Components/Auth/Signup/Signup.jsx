import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { signup } from '../../../Redux/User/userActions'
import styles from './Signup.module.scss'

const Signup = () => {
    const { user } = useSelector(state => state.userReducer);
    const [formData, setFormData] = useState({ 
        name: "", email: "", password: "", phone: "", about: "Hey there! I am using SpideyChat." 
    })
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/home');
    }, [user]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSignup = (e) => {
        e.preventDefault();
        dispatch(signup(formData));
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
                        Join the Web!
                    </motion.h2>
                    <p>Every spider needs a team. Create your profile and start swinging through the multiverse.</p>
                    <div className={styles.floatingIcon}>🕷️</div>
                </div>

                <div className={styles.right}>
                    <div className={styles.heading}>
                        <h3>Signup</h3>
                        <p>Already a wall-crawler? <span className={styles.link} onClick={() => navigate('/login')}>Login</span></p>
                    </div>

                    <form className={styles.infoContainer} onSubmit={handleSignup}>
                        <div className={styles.inputGroup}>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name} 
                                onChange={handleChange} 
                                placeholder='Full Name'
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email} 
                                onChange={handleChange} 
                                placeholder='Email Address'
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <input 
                                type="password" 
                                name="password"
                                value={formData.password} 
                                onChange={handleChange} 
                                placeholder='Password'
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <input 
                                type="text" 
                                name="phone"
                                value={formData.phone} 
                                onChange={handleChange} 
                                placeholder='Phone (Optional)'
                            />
                        </div>
                        <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                            <input 
                                type="text" 
                                name="about"
                                value={formData.about} 
                                onChange={handleChange} 
                                placeholder='About you...'
                            />
                        </div>
                        
                        <div className={styles.submit} style={{ gridColumn: '1 / -1' }}>
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                            >
                                Get Your Suit
                            </motion.button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}

export default Signup