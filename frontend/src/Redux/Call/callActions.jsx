import axios from 'axios'
import socket from '../../Socket/Socket';
import { Auido_Only, Call_Rejected, Clear_Offer, Make__Call, Make__Incoming, Recieved_Offer, Set_Call_Receiver, Sotre_Candidate, Sotre_Peer } from '../actionTypes';

const API_URL = process.env.REACT_APP_SERVER_URL;

export const storePeer = (peerConnection)=>{
  return {type: Sotre_Peer, payload: peerConnection}
}

export const makeCall = ()=>{
  return{type: Make__Call}
}

export const makeIncoming = ()=>{
  return {type: Make__Incoming}
}

export const storeCandidate = (candidate)=>{
  return {type: Sotre_Candidate, payload: candidate}
}

export const clearOffer = ()=>{
  return{type: Clear_Offer}
}

export const setReciever = (name)=>{
  return{type: Set_Call_Receiver, payload: name}
}

export const onlyAudio = ()=>{
  return{type: Auido_Only}
}

export const startCall = async (groupChat, localVideoRef, remoteVideoRef, user, audio, dispatch) => {
  try {
    const recipient = groupChat.Users.find((each) => each !== user._id);
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    // Local stream setup
    const constraints = audio
      ? { audio: true }
      : { video: { width: 1280, height: 720 }, audio: true };

    const localStream = await navigator.mediaDevices.getUserMedia(constraints);
    localVideoRef.current.srcObject = localStream;

    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    const remoteStream = new MediaStream();
    peerConnection.ontrack = (event) => {
      remoteStream.addTrack(event.track);
      remoteVideoRef.current.srcObject = remoteStream;
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

export const handleAccept = async (offer, remoteVideoRef, sender, audio, localVideoRef, dispatch) => {
  try {
    dispatch(makeCall());
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    const constraints = audio
      ? { audio: true }
      : { video: { width: 1280, height: 720 }, audio: true };

      const localStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Check if localVideoRef is valid
      if (localVideoRef?.current) {
        localVideoRef.current.srcObject = localStream;
      } else {
        console.error('localVideoRef is not properly assigned.');
        return;
      }

    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    const remoteStream = new MediaStream();
    peerConnection.ontrack = (event) => {
      remoteStream.addTrack(event.track);
      remoteVideoRef.current.srcObject = remoteStream;
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending candidate:", event.candidate);
        socket.emit('sendCandidate', { candidate: event.candidate, recipient: sender.id });
      } else {
        console.log("All ICE candidates have been sent.");
      }
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit('sendAnswer', { answer, sender: sender.id });
    dispatch(storePeer(peerConnection));
  } catch (error) {
    console.error('Error accepting call:', error);
  }
};

export const handleReceiveCandidate = async ({ candidate }, peerConnection) => {
  console.log("candidateee")
  if (peerConnection) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
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
    console.log("offer received");
    if(audioOnly) {
      setVid(true);
      dispatch(onlyAudio());
    }
    // Dispatch makeIncoming action
    dispatch(makeIncoming());
    // Dispatch received offer action
    dispatch({ type: Recieved_Offer, payload: { offer, sender }});
  } else {
    console.error('Received invalid offer:', offer);
  }
};

export const handleReceiveAnswer = async ({answer, offer}, peerConnection, groupChat, user, dispatch)=>{
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  const recipient = groupChat.Users.find((each) => each !== user._id);
  console.log("recieved answer")
  
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("Sending candidate:", event.candidate);
      socket.emit('sendCandidate', { candidate: event.candidate, recipient });
    } else {
      console.log("All ICE candidates have been sent.");
    }
  };
  dispatch(storePeer(peerConnection));
}

export const handleEndCall = (peerConnection, localVideoRef, remoteVideoRef, sender, groupChat, user, dispatch) => {
  try {
    // Close the peer connection
    if (peerConnection) {
      peerConnection.close();
      dispatch(clearOffer())
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
    if(sender) {
      socket.emit('endCall', { recipient: sender.id });
    } else {
      const recipient = groupChat.Users.find((each) => each !== user._id);
      socket.emit('endCall', { recipient });
    }
    
    dispatch({ type: Call_Rejected }); // Fixed: Use dispatch instead of return
  } catch (error) {
    console.error('Error ending the call:', error);
  }
};

export const handleRecievedAudio = (data, remoteVideoRef) => {
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

export const handleRecievedVideo =  (data, remoteVideoRef) => {
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

export const handleReject = (sender, dispatch) => {
  socket.emit('callRejected', { sender: sender.id });
  dispatch(clearOffer());
};

export const handleStopVideo = (localVideoRef, sender, groupChat, user)=>{
    const stream = localVideoRef.current.srcObject; // Access the local media stream
    const videoTrack = stream.getVideoTracks()[0]; // Get the video track of the stream

    if (videoTrack) {
      const isStopped = !videoTrack.enabled; // Toggle the current state
      videoTrack.enabled = isStopped; // Stop/Start the video track

      // Notify the receiver about the video state
      if(sender){
        socket.emit('videoStop', {
          recipient: sender.id,
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
  
 export const handleMuteAudio = (localVideoRef, sender, groupChat, user)=>{
    const stream = localVideoRef.current.srcObject; // Access the local media stream
    const audioTrack = stream.getAudioTracks()[0]; // Get the audio track of the stream

    if (audioTrack) {
      const isMuted = !audioTrack.enabled; // Toggle the current state
      audioTrack.enabled = isMuted; // Mute/Unmute the audio track

      // Notify the receiver about the mute/unmute state
      if(sender){
        socket.emit('audioMute', {
          recipient: sender.id,
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
  