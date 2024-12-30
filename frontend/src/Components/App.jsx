import { Route, Routes, useNavigate } from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux'
import styles from './App.module.scss';
import Home from './Home/Home';
import Signup from './Auth/Signup/Signup';
import Login from './Auth/Login/Login';
import { useEffect } from 'react';
import Welcome from './Auth/Welcome/Welcome';
import GlobalSocket from '../Socket/GlobalSocket';
import { joinUser } from '../Socket/GroupSocket';


function App() {
  const {user} = useSelector(state=>state.userReducer);
  const {chats} = useSelector(state=>state.chatReducer);
  const navigate = useNavigate();
  const dispatch= useDispatch()
  
  useEffect(()=>{
    if(user){
      navigate('/home');
    }
  },[user])
  useEffect(()=>{
    if(user){
      joinUser(user)
    }
  }, [])

  


  return (
    <div className={styles.App}>
      <GlobalSocket />
      <Routes>
        <Route path='/home' element={<Home />} />
        <Route path='/signup' element={<Signup />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/' element={<Welcome />}/>
      </Routes>
    </div>
  );
}

export default App;
