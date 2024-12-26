import React, {useRef, useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Ensure this import is present
import styles from './Search.module.scss';
import { closeSearch } from '../../Redux/Home/homeActions';
import { openGroup } from '../../Redux/Group/groupActions';

const Search = () => {
  const { searchUsers } = useSelector((state) => state.homeReducer);
  const {user} = useSelector(state=>state.userReducer);
  const dispatch = useDispatch();
  const boxRef = useRef(null);
  const handleOutsideClick = (event) => {
    // Check if the click target is not inside the box
    if (boxRef.current && !boxRef.current.contains(event.target)) {
      dispatch(closeSearch());
    }
  };

  useEffect(() => {
    // Add event listener to the document
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      // Cleanup the event listener on component unmount
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleClick =(single)=>{
    dispatch(openGroup(user, single));
  }

  return (
    <>
      {searchUsers && searchUsers.length > 0 ? (
        <div ref={boxRef} className={styles.main}>
          {searchUsers.map((single, index) => (
            <div key={index} className={styles.single} onClick={()=>handleClick(single)}>
              <div className={styles.pfp}>
                <div></div>
              </div>
              <div className={styles.info}>
                <span>{single.name}</span>
                <span>{single.email}</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
};

export default Search;
