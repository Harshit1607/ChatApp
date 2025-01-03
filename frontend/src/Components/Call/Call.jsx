import React, { useEffect, useRef, useState } from 'react';
import styles from './Call.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import socket from '../../Socket/Socket';
import { makeCall, makeIncoming, storePeer, storeOffer, clearOffer } from '../../Redux/Call/callActions';
import { Call_Rejected, Recieved_Offer } from '../../Redux/actionTypes';

const Call = () => {
  const { groupChat } = useSelector((state) => state.groupReducer);
  const { user } = useSelector((state) => state.userReducer);
  const { call, incoming, peerConnection, offer,  sender } = useSelector(
    (state) => state.callReducer
  );

  const dispatch = useDispatch();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pendingCandidates = useRef([]); // Ref to store ICE candidates if peerConnection is not ready
  const [position, setPosition] = useState({ x: '50%', y: '50%' });

  useEffect(() => {
    if (call && !offer) {
      startCall();
    }
  }, [call]);

  useEffect(() => {
    const handleReceiveOffer = ({ offer, sender }) => {
      if (offer && offer.sdp && (offer.type === 'offer' || offer.type === 'answer')) {
        dispatch({ type: Recieved_Offer, payload: { offer, sender } });
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
    socket.on('callRejected', handleRejection);

    socket.on('receiveOffer', handleReceiveOffer);
    socket.on('receiveAnswer', handleReceiveAnswer);
    
    socket.on('receiveCandidate', handleReceiveCandidate);

    return () => {
      socket.off('receiveOffer', handleReceiveOffer);
      socket.off('receiveAnswer', handleReceiveAnswer);
      socket.off('callRejected', handleRejection);
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

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      // peerConnection.onicecandidate = (event) => {
      //   if (event.candidate) {
      //     socket.emit('sendCandidate', { candidate: event.candidate, recipient });
      //   }
      // };

      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          const remoteStream = new MediaStream();
          remoteStream.addTrack(event.track);
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit('sendOffer', { offer, recipient, user });
      console.log(peerConnection)
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
  
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
  
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

  const onDragStart = (e) => {
    const { clientX, clientY } = e;
    setPosition({ x: clientX, y: clientY });
  };

  const onDragEnd = (e) => {
    const { clientX, clientY } = e;
    setPosition({ x: clientX, y: clientY });
  };

  return (
    <>
      {call ? (
        <div
          className={styles.incoming}
        >VIdoes
          <video ref={localVideoRef} autoPlay muted></video>
          <video ref={remoteVideoRef} autoPlay></video>
        </div>
      ) : incoming && offer ? (
        <div
          className={styles.main}
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          style={{
            top: position.y,
            left: position.x,
          }}
        >
          <div>
            <button onClick={handleReject}>Reject</button>
            <button onClick={handleAccept}>Accept</button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Call;
