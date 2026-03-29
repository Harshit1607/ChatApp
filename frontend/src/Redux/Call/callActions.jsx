import axios from 'axios'
import socket from '../../Socket/Socket';
import { Audio_Only, Call_Rejected, Clear_Offer, Make__Call, Make__Incoming, Received_Offer, Received_Answer, Set_Call_Receiver, Store_Candidate, Store_Peer } from '../actionTypes';

const API_URL = process.env.REACT_APP_SERVER_URL;

export const storePeer = (peerConnection)=>{
  return {type: Store_Peer, payload: peerConnection}
}

export const makeCall = ()=>{
  return{type: Make__Call}
}

export const makeIncoming = ()=>{
  return {type: Make__Incoming}
}

export const storeCandidate = (candidate)=>{
  return {type: Store_Candidate, payload: candidate}
}

export const clearOffer = ()=>{
  return{type: Clear_Offer}
}

export const setReceiver = (name)=>{
  return{type: Set_Call_Receiver, payload: name}
}

export const onlyAudio = ()=>{
  return{type: Audio_Only}
}

export const startCall = async (groupChat, localVideoRef, remoteVideoRef, user, audio, dispatch) => {
  try {
    const userId = user._id.toString();
    const recipient = groupChat.Users.find((each) => each.toString() !== userId);
    
    if (!recipient) {
      console.error('Recipient not found in group users');
      return;
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    // Local stream setup
    const constraints = audio
      ? { audio: true }
      : { video: { width: 1280, height: 720 }, audio: true };

    const localStream = await navigator.mediaDevices.getUserMedia(constraints);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }

    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    const remoteStream = new MediaStream();
    peerConnection.ontrack = (event) => {
      remoteStream.addTrack(event.track);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('sendCandidate', { candidate: event.candidate, recipient });
      }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit('sendOffer', { offer, recipient, user: {id: user._id, name: user.name}, audio });
    dispatch(storePeer(peerConnection));
  } catch (error) {
    console.error('Error starting call:', error);
  }
};

export const handleAccept = async (offer, remoteVideoRef, sender, audio, localVideoRef, dispatch, pendingCandidates) => {
  try {
    dispatch(makeCall());
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    const constraints = audio
      ? { audio: true }
      : { video: { width: 1280, height: 720 }, audio: true };

    const localStream = await navigator.mediaDevices.getUserMedia(constraints);

    if (localVideoRef?.current) {
      localVideoRef.current.srcObject = localStream;
    } else {
      console.warn('localVideoRef.current is not yet available, stream set to srcObject may fail later');
    }

    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    const remoteStream = new MediaStream();
    peerConnection.ontrack = (event) => {
      remoteStream.addTrack(event.track);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('sendCandidate', { candidate: event.candidate, recipient: sender.id });
      }
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    
    // Process buffered candidates
    if (pendingCandidates?.current) {
        while (pendingCandidates.current.length > 0) {
            const candidate = pendingCandidates.current.shift();
            try {
                await peerConnection.addIceCandidate(candidate);
            } catch (e) {
                console.error("Error processing buffered candidate:", e);
            }
        }
    }

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit('sendAnswer', { answer, sender: sender.id });
    dispatch(storePeer(peerConnection));
  } catch (error) {
    console.error('Error accepting call:', error);
  }
};

export const handleReceiveCandidate = async ({ candidate }, peerConnection, pendingCandidates) => {
  try {
    const iceCandidate = new RTCIceCandidate(candidate);
    if (peerConnection && peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
        await peerConnection.addIceCandidate(iceCandidate);
    } else {
        if (pendingCandidates?.current) {
            pendingCandidates.current.push(iceCandidate);
        }
    }
  } catch (error) {
    console.error('Error adding ICE candidate:', error);
  }
};

export const handleCallEnd = (peerConnection, localVideoRef, remoteVideoRef, dispatch) => {
  if (peerConnection) peerConnection.close();

  if (localVideoRef.current?.srcObject) {
    localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    localVideoRef.current.srcObject = null;
  }

  if (remoteVideoRef.current) {
    remoteVideoRef.current.srcObject = null;
  }

  dispatch(clearOffer());
};

export const handleRejection = () => {
    return{ type: Call_Rejected };
};

export const handleReceiveOffer = ({ offer, sender, audioOnly }, dispatch, setVid) => {
  if (offer && offer.sdp && (offer.type === 'offer' || offer.type === 'answer')) {
    if(audioOnly) {
      setVid(true);
      dispatch(onlyAudio());
    }
    dispatch(makeIncoming());
    dispatch({ type: Received_Offer, payload: { offer, sender }});
  } else {
    console.error('Received invalid offer:', offer);
  }
};

export const handleReceiveAnswer = async ({answer}, peerConnection, groupChat, user, dispatch, pendingCandidates)=>{
  dispatch({ type: Received_Answer, payload: { answer } });
  
  if (peerConnection) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    
    // Process buffered candidates
    if (pendingCandidates?.current) {
      while (pendingCandidates.current.length > 0) {
          const candidate = pendingCandidates.current.shift();
          try {
              await peerConnection.addIceCandidate(candidate);
          } catch (e) {
              console.error("Error processing buffered candidate:", e);
          }
      }
    }
  }
}

export const handleEndCall = (peerConnection, localVideoRef, remoteVideoRef, sender, groupChat, user, dispatch) => {
  try {
    if (peerConnection) {
      peerConnection.close();
    }

    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if(sender) {
      socket.emit('endCall', { recipient: sender.id });
    } else if (groupChat && groupChat.Users) {
      const userId = user._id.toString();
      const recipient = groupChat.Users.find((each) => each.toString() !== userId);
      if (recipient) {
        socket.emit('endCall', { recipient });
      }
    }
    
    dispatch(clearOffer()); 
  } catch (error) {
    console.error('Error ending the call:', error);
  }
};

export const handleRecievedAudio = (data, remoteVideoRef) => {
  if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
    const remoteStream = remoteVideoRef.current.srcObject;
    const audioTrack = remoteStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !data.isMuted;
    }
  }
}

export const handleRecievedVideo =  (data, remoteVideoRef) => {
  if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
    const remoteStream = remoteVideoRef.current.srcObject;
    const videoTrack = remoteStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !data.isStopped;
    }
  }
}

export const handleReject = (sender, dispatch) => {
  socket.emit('callRejected', { sender: sender.id });
  dispatch(clearOffer());
};

export const handleStopVideo = (localVideoRef, sender, groupChat, user) => {
  if (localVideoRef.current && localVideoRef.current.srcObject) {
    const stream = localVideoRef.current.srcObject;
    const videoTrack = stream.getVideoTracks()[0];

    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      const isStopped = !videoTrack.enabled;

      if (sender) {
        socket.emit('videoStop', { recipient: sender.id, isStopped });
      } else if (groupChat && groupChat.Users) {
        const userId = user._id.toString();
        const recipient = groupChat.Users.find((each) => each.toString() !== userId);
        if (recipient) {
          socket.emit('videoStop', { recipient, isStopped });
        }
      }
    }
  }
};

export const handleMuteAudio = (localVideoRef, sender, groupChat, user)=>{
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject;
      const audioTrack = stream.getAudioTracks()[0];

      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const isMuted = !audioTrack.enabled;

        if(sender){
          socket.emit('audioMute', { recipient: sender.id, isMuted });
        } else if (groupChat && groupChat.Users) {
          const userId = user._id.toString();
          const recipient = groupChat.Users.find((each) => each.toString() !== userId);
          if (recipient) {
            socket.emit('audioMute', { recipient, isMuted });
          }
        }
      }
    }
};