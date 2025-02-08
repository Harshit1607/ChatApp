import React, { useEffect, useRef, useState } from 'react';
import styles from './Call.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import socket from '../../Socket/Socket';
import { startCall, handleRejection, handleReceiveOffer, handleReceiveAnswer, handleReceiveCandidate, handleCallEnd, handleRecievedAudio, handleRecievedVideo, handleAccept, handleReject, handleMuteAudio, handleEndCall, handleStopVideo } from '../../Redux/Call/callActions';
import mic from '../../Assets/mic.svg';
import video1 from '../../Assets/video1.svg';
import micCut from '../../Assets/micCut.svg';
import videoCut from '../../Assets/videoCut.svg';
import callIcon from '../../Assets/call.svg';

const Call = () => {
  const { groupChat } = useSelector((state) => state.groupReducer);
  const { user } = useSelector((state) => state.userReducer);
  const { call, incoming, peerConnection, offer, sender, audio } = useSelector(
    (state) => state.callReducer
  );

  const dispatch = useDispatch();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pendingCandidates = useRef([]); // Ref to store ICE candidates if peerConnection is not ready

  const [mute, setMute] = useState(false);
  const [vid, setVid] = useState(false);

  useEffect(() => {
    console.log(incoming)
    if (call && !offer) {
      if(audio){
        setVid(true);
      }
      startCall(groupChat, localVideoRef, remoteVideoRef, user, audio, dispatch);
    }
  }, [call, incoming]);

  useEffect(() => {
    
    const handleAudioMute = (data) => handleRecievedAudio(data, remoteVideoRef);
    const handleVideoStop = (data) => handleRecievedVideo(data, remoteVideoRef);
    const handleEndCall = () => handleCallEnd(peerConnection, localVideoRef, remoteVideoRef, dispatch);
    const handleCallRejected = () => handleRejection();
    const handleOffer = (data) => handleReceiveOffer(data, dispatch, setVid);
    const handleAnswer = (data) => handleReceiveAnswer(data, peerConnection, groupChat, user, dispatch);
    const handleCandidate = (data) => handleReceiveCandidate(data, peerConnection, pendingCandidates, dispatch);
  
    socket.on('audioMute', handleAudioMute);
    socket.on('videoStop', handleVideoStop);
    socket.on('endCall', handleEndCall);
    socket.on('callRejected', handleCallRejected);
    socket.on('receiveOffer', handleOffer);
    socket.on('receiveAnswer', handleAnswer);
    socket.on('receiveCandidate', handleCandidate);
  
    return () => {
      socket.off('audioMute', handleAudioMute);
      socket.off('videoStop', handleVideoStop);
      socket.off('endCall', handleEndCall);
      socket.off('callRejected', handleCallRejected);
      socket.off('receiveOffer', handleOffer);
      socket.off('receiveAnswer', handleAnswer);
      socket.off('receiveCandidate', handleCandidate);
    };
  });



  useEffect(() => {
    if (peerConnection) {
      peerConnection.addEventListener('connectionstatechange', () => {
        pendingCandidates.current.forEach((candidate) => {
          peerConnection.addIceCandidate(candidate).catch((error) =>
            console.error('Error adding ICE candidate after connection:', error)
          );
        });
        pendingCandidates.current = [];
      });
    }
  }, [peerConnection]);


  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - 125,
    y: window.innerHeight / 2 - 225,
  });
  
  useEffect(() => {
    const handleResize = () => {
      setPosition((prevPosition) => ({
        x: Math.min(prevPosition.x, window.innerWidth - 250),
        y: Math.min(prevPosition.y, window.innerHeight - 450),
      }));
    };
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const onDragStart = (e) => {
    const { clientX, clientY } = e;
    setPosition({ x: clientX, y: clientY });
  };
  
  const onDrag = (e) => {
    if (e.clientX === 0 && e.clientY === 0) return;
    const { clientX, clientY } = e;
  
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
  
    const element = e.target;
    const rect = element.getBoundingClientRect();
  
    const newX = Math.min(
      Math.max(clientX - rect.width / 2, 0),
      windowWidth - rect.width
    );
    const newY = Math.min(
      Math.max(clientY - rect.height / 2, 0),
      windowHeight - rect.height
    );
  
    setPosition({ x: newX, y: newY });
  };
  
  const onDragEnd = (e) => {
    const { clientX, clientY } = e;
    setPosition({ x: clientX, y: clientY });
  };

  return (
    <>
      {call ? (
        <div
          className={styles.main}
          draggable
          onDragStart={onDragStart}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
          style={{
            position: "absolute",
            top: position.y,
            left: position.x,
          }}
        > {
          audio?
          <>
            <div className={styles.avBox}>
              {console.log(localVideoRef)}
              <span>{user.name}</span>
              <audio ref={localVideoRef} autoPlay muted ></audio>
            </div>
            <div className={styles.avBox}>
              {/* <span>{sender.name}</span> */}
              <audio ref={remoteVideoRef} autoPlay></audio>
            </div>
          </>
          :
          <>
          <div className={styles.avBox}>
          <span>{user.name}</span>
          <video ref={localVideoRef} autoPlay playsInline muted ></video>
          </div>
          <div className={styles.avBox}>
          {/* <span>{sender.name}</span> */}
          <video ref={remoteVideoRef} autoPlay playsInline ></video>
          </div>
          </>
        }
          
          <div className={styles.control}>
            <button onClick={()=>{setMute(!mute);handleMuteAudio(localVideoRef, sender, groupChat, user)}} style={{ opacity: mute ? '0.5' : '1' }}  ><img src={mute? micCut: mic} /></button>
            <button onClick={()=>handleEndCall(peerConnection, localVideoRef, remoteVideoRef, sender, groupChat, user, dispatch)}>End</button>
            <button onClick={()=>{setVid(!vid);handleStopVideo(localVideoRef, sender, groupChat, user)}} style={{ opacity: vid ? '0.5' : '1' }} ><img src={vid? videoCut:video1} /></button>
          </div>
        </div>
      ) : incoming && offer ? (
        <div
          className={styles.incoming}
          draggable
          onDragStart={onDragStart}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
          style={{
            position: "absolute",
            top: position.y,
            left: position.x,
          }}
        >
          <div className={styles.info}>
            <span>{sender? sender.name : null}</span>
          </div>
          <div className={styles.acceptReject}>
            <button onClick={()=>handleReject(sender, dispatch)}><img src={callIcon}/></button>
            <button onClick={()=>handleAccept(offer, remoteVideoRef, sender, audio, localVideoRef, dispatch)}><img src={callIcon}/></button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Call;
