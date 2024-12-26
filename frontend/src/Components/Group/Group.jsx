import React, {useRef, useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Ensure this import is present
import { closeSearch } from '../../Redux/Home/homeActions';
import { closeGroup, createGroup, openGroup } from '../../Redux/Group/groupActions';
import styles from './Group.module.scss'

const Group = () => {
  const {user} = useSelector(state=>state.userReducer);
  const {makeGroup} = useSelector(state=>state.groupReducer);
  const {allUsers} = useSelector(state=>state.homeReducer);
  const [text, setText] = useState("");
  const dispatch = useDispatch();
  const boxRef = useRef(null);
  const handleOutsideClick = (event) => {
    // Check if the click target is not inside the box
    if (boxRef.current && !boxRef.current.contains(event.target)) {
      dispatch(closeGroup());
    }
  };

  const othersUsers = [];

  useEffect(() => {
    // Add event listener to the document
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      // Cleanup the event listener on component unmount
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleClick =(single)=>{
    othersUsers.push(single);
  }
  const handleText =(e)=>{
    const value = e.target.value;
    setText(value);
  }
  const handleSubmit = () =>{
    const others = [...new Set(othersUsers)];
    dispatch(createGroup(text, user, others));
    dispatch(closeGroup());
  }
  return (
    <>
        {makeGroup ? <div className={styles.main} ref={boxRef}>
          <div className={styles.name}>
            <input type="text" onChange={(e)=>handleText(e)}/>
          </div>
        <div  className={styles.Users}>
        {allUsers.map((single, index) => {
          if (single._id === user._id) {
            return null; // Skip rendering for this user
          }
          return (
            <div
              key={index}
              className={othersUsers.includes(single) ? styles.include : styles.single}
              onClick={() => handleClick(single)}
            >
              <div className={styles.pfp}>
                <div></div>
              </div>
              <div className={styles.info}>
                <span>{single.name}</span>
                <span>{single.email}</span>
              </div>
            </div>
          );
        })}

        </div>
        <div className={styles.make}>
          <button onClick={handleSubmit}>Make</button>
        </div>
        </div>: null}
    </>
  );
}

export default Group