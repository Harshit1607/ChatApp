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
import Call from './Call/Call';
import Settings from './Settings/Settings';
import GroupProfile from './Profile/GroupProfile/GroupProfile';
import UserProfile from './Profile/UserProfile/UserProfile';
// import GroupCall from './GroupCall/GroupCall';
// import { DailyProvider,} from '@daily-co/daily-react';


function App() {
  const {user} = useSelector(state=>state.userReducer);
  const {chats} = useSelector(state=>state.chatReducer);
  const navigate = useNavigate();
  const dispatch= useDispatch()
  
  useEffect(()=>{
    if(user){
      navigate('/home');
    }
  },[])
  useEffect(()=>{
    if(user){
      joinUser(user._id)
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
        <Route path='/settings' element={<Settings />}/>
        <Route path='/groupProfile' element={<GroupProfile />}/>
        <Route path='/userProfile' element={<UserProfile />}/>
      </Routes>
      <Call />
      {/* <DailyProvider>
        <GroupCall />
      </DailyProvider> */}
      
    </div>
  );
}

export default App;
