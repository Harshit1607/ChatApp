import React, { useEffect, useRef, useState } from 'react';
import styles from './Call.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import socket from '../../Socket/Socket';
import { startCall, makeCall, handleRejection, handleReceiveOffer, handleReceiveAnswer, handleReceiveCandidate, handleCallEnd, handleRecievedAudio, handleRecievedVideo, handleAccept, handleReject, handleMuteAudio, handleEndCall, handleStopVideo, setReceiver } from '../../Redux/Call/callActions';
import mic from '../../Assets/mic.svg';
import video1 from '../../Assets/video1.svg';
import micCut from '../../Assets/micCut.svg';
import videoCut from '../../Assets/videoCut.svg';
import callIcon from '../../Assets/call.svg';

const Call = () => {
  const { groupChat } = useSelector((state) => state.groupReducer);
  const { user } = useSelector((state) => state.userReducer);
  const { call, incoming, peerConnection, offer, sender, audio, receiver } = useSelector(
    (state) => state.callReducer
  );

  const dispatch = useDispatch();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pendingCandidates = useRef([]); // Ref to store ICE candidates if peerConnection is not ready

  const [mute, setMute] = useState(false);
  const [vid, setVid] = useState(false);

  // Handle starting outgoing call
  useEffect(() => {
    if (call && !offer && !peerConnection && localVideoRef.current) {
      if(audio){
        setVid(true);
      }
      const otherUser = groupChat.UserDetails.find((each) => each._id !== user._id);
      if (otherUser) {
        dispatch(setReceiver(otherUser.name));
      }
      startCall(groupChat, localVideoRef, remoteVideoRef, user, audio, dispatch);
    }
  }, [call, offer, peerConnection, groupChat, user, audio, dispatch]);

  // Handle accepting incoming call
  useEffect(() => {
    if (call && offer && !peerConnection && localVideoRef.current) {
      handleAccept(offer, remoteVideoRef, sender, audio, localVideoRef, dispatch, pendingCandidates);
    }
  }, [call, offer, peerConnection, sender, audio, dispatch]);

  // Socket event listeners
  useEffect(() => {
    const handleAudioMute = (data) => handleRecievedAudio(data, remoteVideoRef);
    const handleVideoStop = (data) => handleRecievedVideo(data, remoteVideoRef);
    const handleEndCallLocal = () => handleCallEnd(peerConnection, localVideoRef, remoteVideoRef, dispatch);
    const handleCallRejected = () => dispatch(handleRejection());
    const handleOffer = (data) => handleReceiveOffer(data, dispatch, setVid);
    const handleAnswer = (data) => handleReceiveAnswer(data, peerConnection, groupChat, user, dispatch, pendingCandidates);
    const handleCandidate = (data) => handleReceiveCandidate(data, peerConnection, pendingCandidates);
  
    socket.on('audioMute', handleAudioMute);
    socket.on('videoStop', handleVideoStop);
    socket.on('endCall', handleEndCallLocal);
    socket.on('callRejected', handleCallRejected);
    socket.on('receiveOffer', handleOffer);
    socket.on('receiveAnswer', handleAnswer);
    socket.on('receiveCandidate', handleCandidate);
  
    return () => {
      socket.off('audioMute', handleAudioMute);
      socket.off('videoStop', handleVideoStop);
      socket.off('endCall', handleEndCallLocal);
      socket.off('callRejected', handleCallRejected);
      socket.off('receiveOffer', handleOffer);
      socket.off('receiveAnswer', handleAnswer);
      socket.off('receiveCandidate', handleCandidate);
    };
  }, [peerConnection, groupChat, user, dispatch]);



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


  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth - 350,
    y: 80,
  });
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    // Only allow dragging from the main container, not buttons
    if (e.target.tagName.toLowerCase() === 'button' || e.target.closest('button')) return;
    
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;

      // Keep within bounds
      const boundedX = Math.max(0, Math.min(newX, window.innerWidth - 320));
      const boundedY = Math.max(0, Math.min(newY, window.innerHeight - 480));

      setPosition({ x: boundedX, y: boundedY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <>
      {call ? (
        <div
          className={`${styles.main} ${isDragging ? styles.dragging : ""}`}
          onMouseDown={handleMouseDown}
          style={{
            position: "fixed",
            top: position.y,
            left: position.x,
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          {audio ? (
            <div className={styles.audioDisplay}>
              <div className={styles.avatarContainer}>
                <div className={styles.ripple} />
                <div className={styles.avatar}>
                  {receiver?.[0]?.toUpperCase() || sender?.name?.[0]?.toUpperCase() || "?"}
                </div>
              </div>
              <div className={styles.callerInfo}>
                <h2>{receiver || sender?.name || "Unknown"}</h2>
                <span>Spider-Signal Active...</span>
              </div>
              <audio ref={localVideoRef} autoPlay muted />
              <audio ref={remoteVideoRef} autoPlay />
            </div>
          ) : (
            <div className={styles.videoDisplay}>
              <video ref={remoteVideoRef} autoPlay playsInline className={styles.remoteVideo} />
              <div className={styles.localVideoPIP}>
                 <video ref={localVideoRef} autoPlay playsInline muted />
              </div>
            </div>
          )}
          
          <div className={styles.controlBar}>
            <button 
              onClick={() => { setMute(!mute); handleMuteAudio(localVideoRef, sender, groupChat, user) }} 
              className={mute ? styles.muteActive : ""}
              title={mute ? "Unmute" : "Mute"}
            >
              <img src={mute ? micCut : mic} alt="mic" />
            </button>
            <button 
              onClick={() => { setVid(!vid); handleStopVideo(localVideoRef, sender, groupChat, user) }} 
              className={vid ? styles.muteActive : ""}
              title={vid ? "Start Video" : "Stop Video"}
            >
              <img src={vid ? videoCut : video1} alt="video" />
            </button>
            <button 
              onClick={() => handleEndCall(peerConnection, localVideoRef, remoteVideoRef, sender, groupChat, user, dispatch)} 
              className={styles.endCall}
              title="End Call"
            >
              End
            </button>
          </div>
        </div>
      ) : incoming && offer ? (
        <div
          className={`${styles.incoming} ${isDragging ? styles.dragging : ""}`}
          onMouseDown={handleMouseDown}
          style={{
            position: "fixed",
            top: position.y,
            left: position.x,
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          <div className={styles.callerDetails}>
            <h3>{sender?.name || "Unknown Spider"}</h3>
            <p>Incoming {audio ? "Audio" : "Video"} Signal</p>
          </div>
          <div className={styles.actions}>
            <button className={styles.reject} onClick={() => handleReject(sender, dispatch)}>
              <img src={callIcon} alt="reject" />
            </button>
            <button className={styles.accept} onClick={() => dispatch(makeCall())}>
              <img src={callIcon} alt="accept" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Call;

