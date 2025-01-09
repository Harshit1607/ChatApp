// import styles from './GroupCall.module.scss';
// import React, { useEffect, useState, useRef, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import socket from '../../Socket/Socket';
// import { makeGroupCall, makeGroupIncoming } from '../../Redux/GroupCall/groupcallActions';
// import { 
//   DailyProvider,
//   useDaily,
//   useLocalSessionId,
//   useParticipantIds,
//   DailyVideo,
//   useDevices
// } from '@daily-co/daily-react';

// const GroupCall = () => {
//   const [callInstance, setCallInstance] = useState(null);
//   const [roomToken, setRoomToken] = useState(null);
//   const [roomUrl, setRoomUrl] = useState(null);
//   const daily = useDaily();
//   // Redux state selectors
//   const { groupCall, groupCallIncoming } = useSelector(state => state.groupcallReducer);
//   const { groupChat } = useSelector(state => state.groupReducer);
//   const { user } = useSelector(state => state.userReducer);

//   // Video element references
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const videoContainerRef = useRef();
//   const dispatch = useDispatch();

//   const localSessionId = useLocalSessionId();
//   const participantIds = useParticipantIds();
//   const { cameras } = useDevices();

//   const getDeviceConstraints = useCallback(async () => {
//     try {
//       const devices = await navigator.mediaDevices.enumerateDevices();
//       const hasCamera = devices.some(device => device.kind === 'videoinput');
//       const hasMic = devices.some(device => device.kind === 'audioinput');

//       return {
//         video: hasCamera ? {
//           width: { ideal: 640 },
//           height: { ideal: 480 },
//           frameRate: { max: 30 }
//         } : false,
//         audio: hasMic
//       };
//     } catch (err) {
//       console.error('Error enumerating devices:', err);
//       return { video: false, audio: false };
//     }
//   }, []);

//   const initializeDevices = useCallback(async () => {
//     try {
//       const constraints = await getDeviceConstraints();
//       await navigator.mediaDevices.getUserMedia(constraints);
//     } catch (err) {
//       console.error('Error accessing media devices:', err);
//     }
//   }, [getDeviceConstraints]);

//   useEffect(() => {
//     initializeDevices();
//   }, [initializeDevices]);

//   const joinRoom = async (url, token) => {
//     try {
//       const constraints = await getDeviceConstraints();
//       await daily.join({ 
//         url, 
//         token,
//         videoSource: constraints.video,
//         audioSource: constraints.audio,
//       });
//     } catch (error) {
//       console.error('Error joining room:', error);
//     }
//   };

//   // Start call when groupCall state changes
//   useEffect(() => {
//     if (groupCall && !groupCallIncoming) {
//       startCall();
//     }
//   }, [groupCall]);

//   useEffect(()=>{
//     socket.on('incoming-group-call', handleIncomingGroupCall);
//     return ()=>{
//       socket.off('incoming-group-call', handleIncomingGroupCall);
//     }
//   })

//   const handleIncomingGroupCall = async ({roomName, token, url}) => {
//     setRoomToken(token);
//     setRoomUrl(url);
//     if(groupCall) {
//       console.log("HI");
//       senderInstance();
//       return;
//     }
//     dispatch(makeGroupIncoming());
//   };

//   const senderInstance = async ()=>{
//     try{
//       // Join the room
//       joinRoom(roomUrl, roomToken);
  
//     } catch (error) {
//       console.error('Error joining the room:', error);
//     }
//   }

//   const startCall = () =>{
//     socket.emit('initiate-group-call', {group: groupChat, user});
//   }

//   const handleAccept = async () => {
//     console.log('roomUrl:', roomUrl);
//     console.log('roomToken:', roomToken);
//     if (roomUrl && roomToken) {
//       try {
//         joinRoom(roomUrl, roomToken);
//         dispatch(makeGroupCall());
//       } catch (error) {
//         console.error('Error joining the room:', error);
//       }
//     } else {
//       console.error('Room URL or Token is missing');
//     }
//   };

//   const LocalVideo = () => (
//     <div className={styles.avBox}>
//       {localSessionId && (
//         <DailyVideo 
//           participantid={localSessionId} 
//           className={styles.localVideo}
//           mirror
//         />
//       )}
//     </div>
//   );

//   const RemoteVideos = () => (
//     <>
//       {participantIds
//         .filter(id => id !== localSessionId)
//         .map(id => (
//           <div key={id} className={styles.avBox}>
//             <DailyVideo 
//               participantid={id} 
//               className={styles.remoteVideo}
//             />
//           </div>
//         ))}
//     </>
//   );

//   const handleReject = ()=>{

//   }

//   const handleLeaveCall = () => {
//     if (daily) {
//       daily.leave();
//     }
//     dispatch(makeGroupIncoming(false));
//   };

//   // Position management for draggable window
//   const [position, setPosition] = useState({
//     x: window.innerWidth / 2 - 125,
//     y: window.innerHeight / 2 - 225,
//   });
  
//   useEffect(() => {
//     const handleResize = () => {
//       setPosition((prevPosition) => ({
//         x: Math.min(prevPosition.x, window.innerWidth - 250),
//         y: Math.min(prevPosition.y, window.innerHeight - 450),
//       }));
//     };
  
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);
  
//   const onDragStart = (e) => {
//     const { clientX, clientY } = e;
//     setPosition({ x: clientX, y: clientY });
//   };
  
//   const onDrag = (e) => {
//     if (e.clientX === 0 && e.clientY === 0) return;
//     const { clientX, clientY } = e;
  
//     const windowHeight = window.innerHeight;
//     const windowWidth = window.innerWidth;
  
//     const element = e.target;
//     const rect = element.getBoundingClientRect();
  
//     const newX = Math.min(
//       Math.max(clientX - rect.width / 2, 0),
//       windowWidth - rect.width
//     );
//     const newY = Math.min(
//       Math.max(clientY - rect.height / 2, 0),
//       windowHeight - rect.height
//     );
  
//     setPosition({ x: newX, y: newY });
//   };
  
//   const onDragEnd = (e) => {
//     const { clientX, clientY } = e;
//     setPosition({ x: clientX, y: clientY });
//   };

//   // Render component
//   return (
//     <>
//       {groupCall ? (
//         <div
//         className={styles.main}
//         draggable
//         onDragStart={onDragStart}
//         onDrag={onDrag}
//         onDragEnd={onDragEnd}
//         style={{
//           position: "absolute",
//           top: position.y,
//           left: position.x,
//         }}
//       >
//         <LocalVideo />
//         <RemoteVideos />
//         <div className={styles.controls}>
//           <button onClick={handleLeaveCall}>End Call</button>
//         </div>
//       </div>
//       ) : groupCallIncoming ? 
//       (<div className={styles.incoming}
//         draggable
//         onDragStart={onDragStart}
//         onDrag={onDrag}
//         onDragEnd={onDragEnd}
//         style={{
//           position: "absolute",
//           top: position.y,
//           left: position.x,
//         }}>
//         <div className={styles.info}>
//           <span>Incoming Call</span>
//         </div>
//         <div className={styles.acceptReject}>
//           <button onClick={handleReject}>Reject</button>
//           <button onClick={handleAccept}>Accept</button>
//         </div>
//       </div>)
//       : null}
//     </>
// );
// };

// export default GroupCall;