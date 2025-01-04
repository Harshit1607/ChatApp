import React, { useEffect, useRef, useState } from 'react';
import styles from './Call.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import socket from '../../Socket/Socket';
import { makeCall, makeIncoming, storePeer, storeOffer, clearOffer, onlyAudio } from '../../Redux/Call/callActions';
import { Call_Rejected, Recieved_Offer } from '../../Redux/actionTypes';

const Call = () => {
  const { groupChat } = useSelector((state) => state.groupReducer);
  const { user } = useSelector((state) => state.userReducer);
  const { call, incoming, peerConnection, offer,  sender, audio } = useSelector(
    (state) => state.callReducer
  );

  const dispatch = useDispatch();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pendingCandidates = useRef([]); // Ref to store ICE candidates if peerConnection is not ready

  useEffect(() => {
    if (call && !offer) {
      startCall();
    }
  }, [call]);

  useEffect(() => {
    const handleReceiveOffer = ({ offer, sender, audioOnly }) => {
      if (offer && offer.sdp && (offer.type === 'offer' || offer.type === 'answer')) {
        dispatch({ type: Recieved_Offer, payload: { offer, sender } });
        if(audioOnly){
          
          dispatch(onlyAudio())
        }
        dispatch(makeIncoming());
      } else {
        console.error('Received invalid offer:', offer);
      }
    };

    const handleReceiveAnswer = async ({answer, offer})=>{
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      const recipient = groupChat.Users.find((each) => each !== user._id);

      
      peerConnection.onicecandidate = (event) => {
        console.log(event.candidate)
        if (event.candidate) {
          console.log(event.candidate)
          socket.emit('sendCandidate', { candidate: event.candidate, recipient });
        }
      };
      dispatch(storePeer(peerConnection));
    }

    

    const handleReceiveCandidate = async ({ candidate }) => {
      console.log(peerConnection)
      if (peerConnection) {
        try {
          console.log(peerConnection)
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          dispatch(storePeer(peerConnection));
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      } else {
        console.log("not")
        pendingCandidates.current.push(candidate);
      }
    };

    const handleRejection = () => {
      dispatch({ type: Call_Rejected });
    };

    const handleCallEnd = () => {
      // Perform the same cleanup on the receiving side
      if (peerConnection) {
        peerConnection.close();
        dispatch(storePeer(null));
      }
  
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject;
        stream.getTracks().forEach((track) => track.stop());
        localVideoRef.current.srcObject = null;
      }
  
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
  
      dispatch({ type: Call_Rejected });
      console.log('Call ended by the other party.');
    };

    const handleRecievedAudio = (data) => {
      console.log(`Sender audio mute state: ${data.isMuted}`);

      // Use remoteVideoRef to access the remote stream
      if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
        const remoteStream = remoteVideoRef.current.srcObject;
        const audioTrack = remoteStream.getAudioTracks()[0]; // Get the audio track of the remote stream
        if (audioTrack) {
          audioTrack.enabled = data.isMuted; // Mute/Unmute the audio track based on sender's action
        }
      }
    
      // Update UI to reflect mute status
      if (data.isMuted) {
        console.log('Sender muted their audio');
      } else {
        console.log('Sender unmuted their audio');
      }
    }

    const handleRecievedVideo =  (data) => {
      console.log(`Sender video stop state: ${data.isStopped}`);

      // Use remoteVideoRef to access the remote stream
      if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
        const remoteStream = remoteVideoRef.current.srcObject;
        const videoTrack = remoteStream.getVideoTracks()[0]; // Get the video track of the remote stream
        if (videoTrack) {
          videoTrack.enabled = data.isStopped; // Stop/Start the video track based on sender's action
        }
      }

      // Update UI to reflect video state
      if (data.isStopped) {
        console.log('Sender stopped their video');
      } else {
        console.log('Sender started their video');
      }
    }
      socket.on('audioMute', handleRecievedAudio);
      socket.on('videoStop', handleRecievedVideo);
      socket.on('endCall', handleCallEnd);
      socket.on('callRejected', handleRejection);
      socket.on('receiveOffer', handleReceiveOffer);
      socket.on('receiveAnswer', handleReceiveAnswer);
      socket.on('receiveCandidate', handleReceiveCandidate);
    
      return () => {
        socket.off('audioMute', handleRecievedAudio);
        socket.off('videoStop', handleRecievedVideo);
        socket.off('endCall', handleCallEnd);
        socket.off('callRejected', handleRejection);
        socket.off('receiveOffer', handleReceiveOffer);
        socket.off('receiveAnswer', handleReceiveAnswer);
        socket.off('receiveCandidate', handleReceiveCandidate);
      };
  });

  

  const startCall = async () => {
    try {
      const recipient = groupChat.Users.find((each) => each !== user._id);
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      });
      if(audio){
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });
      }else{
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });
      }
      

      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          const remoteStream = new MediaStream();
          remoteStream.addTrack(event.track);
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      socket.emit('sendOffer', { offer, recipient, user, audio });
    
      dispatch(storePeer(peerConnection));
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const handleReject = () => {
    socket.emit('callRejected', { sender });
    dispatch(clearOffer());
  };

  const handleAccept = async () => {
    if (!offer) {
      console.error('No offer to accept');
      return;
    }
  
    try {
      dispatch(makeCall());
  
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
  
      
  
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('sendCandidate', {
            candidate: event.candidate.toJSON(),
            recipient: sender._id,
          });
        }
      };
  
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          const remoteStream = new MediaStream();
          remoteStream.addTrack(event.track);
  
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };
  
      if(audio){
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });
      }else{
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });
      }
  
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
  
      socket.emit('sendAnswer', { answer, sender });
      dispatch(storePeer(peerConnection));
      console.log(call)
    } catch (error) {
      console.error('Error during call accept:', error);
    }
  };

  const handleStopVideo = ()=>{
    const stream = localVideoRef.current.srcObject; // Access the local media stream
    const videoTrack = stream.getVideoTracks()[0]; // Get the video track of the stream

    if (videoTrack) {
      const isStopped = !videoTrack.enabled; // Toggle the current state
      videoTrack.enabled = isStopped; // Stop/Start the video track

      // Notify the receiver about the video state
      if(sender){
        socket.emit('videoStop', {
          recipient: sender._id,
          isStopped: isStopped, // True if stopped, false if started
        });
      }else{
        const recipient = groupChat.Users.find((each) => each !== user._id);
        socket.emit('videoStop', {
          recipient,
          isStopped: isStopped, // True if stopped, false if started
        });
      }
    }
  };
  
  const handleMuteAudio = ()=>{
    const stream = localVideoRef.current.srcObject; // Access the local media stream
    const audioTrack = stream.getAudioTracks()[0]; // Get the audio track of the stream

    if (audioTrack) {
      const isMuted = !audioTrack.enabled; // Toggle the current state
      audioTrack.enabled = isMuted; // Mute/Unmute the audio track

      // Notify the receiver about the mute/unmute state
      if(sender){
        socket.emit('audioMute', {
          recipient: sender._id,
          isMuted: isMuted, // True if muted, false if unmuted
        });
      }else{
        const recipient = groupChat.Users.find((each) => each !== user._id);
        socket.emit('audioMute', {
          recipient,
          isMuted: isMuted, // True if muted, false if unmuted
        });
      }
    
  }};
  
  const handleEndCall = () =>{
    try {
      // Close the peer connection
      if (peerConnection) {
        peerConnection.close();
        dispatch(storePeer(null)); // Clear the peer connection in the state
      }
  
      // Stop all local media tracks
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject;
        stream.getTracks().forEach((track) => track.stop());
        localVideoRef.current.srcObject = null;
      }
  
      // Stop the remote video
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
  
      // Notify the other party
      if(sender){
        socket.emit('endCall', { recipient: sender._id });
      }else{
        const recipient = groupChat.Users.find((each) => each !== user._id);
        socket.emit('endCall', { recipient });
      }
      
      dispatch({ type: Call_Rejected });
  
      console.log('Call ended successfully.');
    } catch (error) {
      console.error('Error ending the call:', error);
    }
  }

  useEffect(() => {
    
    if (peerConnection) {
      console.log(peerConnection)
      peerConnection.addEventListener('connectionstatechange', () => {
        
          // Add pending candidates once connection is established
          pendingCandidates.current.forEach((candidate) => {
            peerConnection.addIceCandidate(candidate).catch((error) => {
              console.error('Error adding ICE candidate after connection:', error);
            });
          });
          pendingCandidates.current = [];
        }
      );
  
    }
  }, [peerConnection, dispatch]);

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
              {/* <span>{sender? sender.name : user.name}</span> */}
              <audio ref={localVideoRef} autoPlay ></audio>
            </div>
            <div className={styles.avBox}>
              {/* <span>{sender? sender.name : null}</span> */}
              <audio ref={remoteVideoRef} autoPlay></audio>
            </div>
          </>
          :
          <>
          <div className={styles.avBox}>
          {/* <span>{sender? sender.name : user.name}</span> */}
          <video ref={localVideoRef} autoPlay ></video>
          </div>
          <div className={styles.avBox}>
          <video ref={remoteVideoRef} autoPlay></video>
          </div>
          </>
        }
          
          <div className={styles.control}>
            <button onClick={handleMuteAudio}>MA</button>
            <button onClick={handleEndCall}>E</button>
            <button onClick={handleStopVideo}>MV</button>
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
            <button onClick={handleReject}>R</button>
            <button onClick={handleAccept}>A</button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Call;
