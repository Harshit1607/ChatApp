import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeGroup, createGroup } from '../../Redux/Group/groupActions';
import styles from './Group.module.scss';

const Group = () => {
  const { user } = useSelector((state) => state.userReducer);
  const { makeGroup } = useSelector((state) => state.groupReducer);
  const { allUsers } = useSelector((state) => state.homeReducer);

  const [text, setText] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const dispatch = useDispatch();
  const boxRef = useRef(null);

  const handleOutsideClick = useCallback(
    (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        dispatch(closeGroup());
      }
    },
    [dispatch]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [handleOutsideClick]);

  const handleUserClick = (single) => {
    setSelectedUsers((prev) =>
      prev.find((user) => user._id === single._id)
        ? prev.filter((user) => user._id !== single._id) // Deselect if already selected
        : [...prev, single] // Add to selection
    );
  };

  const handleSubmit = () => {
    if (text.trim() === "") {
      alert("Group name cannot be empty!");
      return;
    }
    dispatch(createGroup(text, user, selectedUsers));
    dispatch(closeGroup());
  };

  return (
    <>
      {makeGroup && (
        <div className={styles.main} ref={boxRef}>
          <div className={styles.name}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Name Your Group..."
            />
          </div>
          <div className={styles.Users}>
            {allUsers && allUsers
              .filter((single) => single._id !== user._id) // Exclude current user
              .map((single) => (
                <div
                  key={single._id}
                  className={
                    selectedUsers.some((u) => u._id === single._id)
                      ? styles.include
                      : styles.single
                  }
                  onClick={() => handleUserClick(single)}
                >
                  <div className={styles.pfp}>
                    <div></div>
                  </div>
                  <div className={styles.info}>
                    <span>{single.name}</span>
                    <span>{single.phone}</span>
                  </div>
                </div>
              ))}
          </div>
          <div className={styles.make}>
            <button onClick={handleSubmit}>Create</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Group;
