import { Route, Routes, useNavigate } from 'react-router-dom';
import {useSelector} from 'react-redux'
import styles from './App.module.scss';
import Home from './Home/Home';
import Signup from './Auth/Signup/Signup';
import Login from './Auth/Login/Login';
import { useEffect } from 'react';

function App() {
  const {user} = useSelector(state=>state.userReducer);
  const navigate = useNavigate();
  useEffect(()=>{
    if(user){
      navigate('/');
    }
  },[user])

  return (
    <div className={styles.App}>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signup' element={<Signup />}/>
        <Route path='/login' element={<Login />}/>
      </Routes>
    </div>
  );
}

export default App;
