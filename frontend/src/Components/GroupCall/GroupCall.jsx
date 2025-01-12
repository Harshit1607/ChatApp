import styles from './GroupCall.module.scss';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socket from '../../Socket/Socket';
import { makeGroupCall, makeGroupIncoming } from '../../Redux/GroupCall/groupcallActions';
import { 
  useDaily,
  useLocalSessionId,
  useParticipantIds,
  DailyVideo,
  useDailyEvent
} from '@daily-co/daily-react';

const GroupCall = () => {
  const [callInstance, setCallInstance] = useState(null);
  const [roomToken, setRoomToken] = useState(null);
  const [roomUrl, setRoomUrl] = useState(null);
  const daily = useDaily();
  const [participants, setParticipants] = useState([]); // To hold remote participants
  // Redux state selectors
  const { groupCall, groupCallIncoming } = useSelector(state => state.groupcallReducer);
  const { groupChat } = useSelector(state => state.groupReducer);
  const { user } = useSelector(state => state.userReducer);
  const [localStream, setLocalStream] = useState(null); // To hold local media stream
  const dispatch = useDispatch();
  const participantIds = useParticipantIds(); // This hook provides participant IDs
  const localSessionId = useLocalSessionId(); // This hook provides the local participant's session ID
  // To get the local participant's session ID

  const joinRoom = async (url, token) => {
    try {
      if (!daily) {
        console.error('Daily call object not initialized');
        return;
      }
  
      // First, let's join the room without explicitly enabling media
      await daily.join({ 
        url, 
        token
      });
      console.log('Successfully joined room');
  
      // After joining, request camera and microphone access
      await daily.setLocalVideo(true);
      await daily.setLocalAudio(true);
      console.log('Camera and microphone enabled');
  
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  useEffect(()=>{},[participantIds])

  // Start call when groupCall state changes
  useEffect(() => {
    if (groupCall && !groupCallIncoming) {
      startCall();
    }
  }, [groupCall]);

  useEffect(()=>{
    socket.on('group-call-initiated', handleInitiatedGroupCall)
    socket.on('incoming-group-call', handleIncomingGroupCall);
    return ()=>{
      socket.off('group-call-initiated', handleInitiatedGroupCall)          
      socket.off('incoming-group-call', handleIncomingGroupCall);
    }
  })

    const handleInitiatedGroupCall = async ({roomName, token, url})=>{
      setRoomToken(token);
      setRoomUrl(url);
      joinRoom(url, token)
    }

  const handleIncomingGroupCall = async ({roomName, token, url}) => {
    setRoomToken(token);
    setRoomUrl(url);
    dispatch(makeGroupIncoming());
  };



  const startCall = () =>{
    socket.emit('initiate-group-call', {group: groupChat.Users, user: user._id});
  }

  const handleAccept = async () => {
    console.log('roomUrl:', roomUrl);
    console.log('roomToken:', roomToken);
    if (roomUrl && roomToken) {
      try {
        joinRoom(roomUrl, roomToken);
        dispatch(makeGroupCall());
      } catch (error) {
        console.error('Error joining the room:', error);
      }
    } else {
      console.error('Room URL or Token is missing');
    }
  };

   // Handle participant join and leave events
  // First, let's improve how we handle participant joins
  useDailyEvent('participant-joined', (event) => {
    console.log('Participant joined:', event);
    const { participant } = event;
  
    // Update participants state correctly
    setParticipants((prevParticipants) => {
      // Check if the participant already exists to prevent duplication
      if (prevParticipants.find((p) => p.session_id === participant.session_id)) {
        return prevParticipants; // Don't add if participant already exists
      }
      return [
        ...prevParticipants,
        {
          ...participant,
          tracks: participant.tracks, // Ensure tracks are included
        },
      ];
    });
  });
  
  
  useDailyEvent('participant-updated', (event) => {
    console.log('Participant updated:', event);
    const { participant } = event;
  
    setParticipants((prevParticipants) =>
      prevParticipants.map((p) =>
        p.session_id === participant.session_id
          ? { ...p, tracks: participant.tracks } // Update tracks if participant already exists
          : p
      )
    );
  });
  
  

  useDailyEvent('participant-left', (event) => {
    console.log('Participant left:', event);
    const { participant } = event;
  
    // Remove participant from the state
    setParticipants((prevParticipants) =>
      prevParticipants.filter((p) => p.session_id !== participant.session_id)
    );
  });
  

  useEffect(() => {
    console.log("Participants:", participants);
  }, [participants]);

  
//   useEffect(() => {
//     console.log("Daily instance:", daily);
//     if (daily) {
//       const participants = daily.participants();
//       console.log("Daily participants:", participants);
  
//       const localParticipant = participants?.[daily.localSessionId];
//       if (localParticipant) {
//         console.log("Local participant:", localParticipant);
  
//         // Log track states and types
//         Object.entries(localParticipant.tracks).forEach(([type, track]) => {
//           console.log(`Track ${type}:`, track.state, track.track);
//         });
  
//         // Set the local stream if available
//         const videoTrack = localParticipant.tracks.video?.track;
//         const audioTrack = localParticipant.tracks.audio?.track;
  
//         if (videoTrack || audioTrack) {
//           console.log("Setting local stream with available tracks.");
//           setLocalStream({
//             video: videoTrack,
//             audio: audioTrack,
//           });
//         } else {
//           console.warn("No tracks available for the local participant.");
//         }
//       } else {
//         console.warn("Local participant not found.");
//       }
//     }
//   }, [daily]);

  const handleReject = ()=>{

  }

  const handleLeaveCall = () => {
    if (daily) {
      daily.leave();
    }
    dispatch(makeGroupIncoming(false));
  };

  // Position management for draggable window
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
    if (e.clientX && e.clientY) {
      setPosition((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    }
  };
  
  const onDragEnd = (e) => {
    const { clientX, clientY } = e;
    setPosition({ x: clientX, y: clientY });
  };

  // Render component
  return (
    <>
      {groupCall ? (
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
      >
        {localSessionId && (
      <div className={styles.videoWrapper}>
        <h3>Me</h3>
        <DailyVideo
          sessionId={localSessionId}
          muted
          mirror
          style={{ width: '100px', height: '100px', backgroundColor: 'black' }}
        />
      </div>
    )}
    
    <div>
    {participantIds.map((id) => {
  if (id === localSessionId) return null;
  const participant = participants.find(p => p.session_id === id);
  const videoTrack = participant?.tracks?.video?.track;
  
  if (videoTrack) {
    return (
      <div key={id} className={styles.videoWrapper}>
        <h3>Participant</h3>
        <DailyVideo
          sessionId={id}
          style={{ width: '100px', height: '100px', backgroundColor: 'black' }}
        />
      </div>
    );
  } else {
    return <div key={id}>No video for this participant</div>;
  }
})}
    </div>

        <div className={styles.controls}>
          <button onClick={handleLeaveCall}>End Call</button>
        </div>
      </div>
      ) : groupCallIncoming ? 
      (<div className={styles.incoming}
        draggable
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        style={{
          position: "absolute",
          top: position.y,
          left: position.x,
        }}>
        <div className={styles.info}>
          <span>Incoming Call</span>
        </div>
        <div className={styles.acceptReject}>
          <button onClick={handleReject}>Reject</button>
          <button onClick={handleAccept}>Accept</button>
        </div>
      </div>)
      : null}
    </>
);
};

export default GroupCall;