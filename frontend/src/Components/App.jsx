import { Route, Routes, useNavigate } from 'react-router-dom';
import {useSelector} from 'react-redux'
import styles from './App.module.scss';
import Home from './Home/Home';
import Signup from './Auth/Signup/Signup';
import Login from './Auth/Login/Login';
import { useEffect } from 'react';
import Welcome from './Auth/Welcome/Welcome';

function App() {
  const {user} = useSelector(state=>state.userReducer);
  const navigate = useNavigate();
  useEffect(()=>{
    if(user){
      navigate('/home');
    }
  },[user])

  return (
    <div className={styles.App}>
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
