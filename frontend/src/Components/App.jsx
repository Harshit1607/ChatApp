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
import GroupCall from './GroupCall/GroupCall';
import mm from '../Assets/mmCursor.png';
import og from '../Assets/ogcursor.png';
import gw from '../Assets/gwcursor.png';

function App() {
  const {user} = useSelector(state=>state.userReducer);
  const {groupChat} = useSelector(state=>state.groupReducer);
  const {chats} = useSelector(state=>state.chatReducer);
  const {theme} = useSelector(state=>state.homeReducer);
  const navigate = useNavigate();
  const dispatch= useDispatch()
  
  useEffect(()=>{
    if(!user){
      navigate('/');
    }
  },[])
  useEffect(()=>{
    if(user){
      joinUser(user._id)
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    let cursorUrl = og;
    if (theme === 'mm') cursorUrl = mm;
    else if (theme === 'gw') cursorUrl = gw;
    try {
      // Try setting the cursor with proper URL formatting
      const cursorStyle = `url('${cursorUrl}') 16 16, auto`;
      document.body.style.cursor = cursorStyle;
    } catch (error) {
      console.error('Error setting cursor:', error);
    }
  }, [theme]);


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
      <GroupCall />
      
    </div>
  );
}

export default App;
