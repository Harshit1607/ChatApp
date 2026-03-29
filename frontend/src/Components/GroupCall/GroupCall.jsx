import styles from './GroupCall.module.scss';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socket from '../../Socket/Socket';
import { audioGroupCall, endCall, makeGroupCall, makeGroupIncoming } from '../../Redux/GroupCall/groupcallActions';

// Use the React SDK instead of video-store
import {
  useHMSStore,
  useHMSActions,
  selectPeers,
  selectIsConnectedToRoom,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectLocalPeer,
  selectPeerCount,
  selectAudioTrackByPeerID,
  useVideo,
  useAVToggle,
  HMSRoomProvider
} from "@100mslive/react-sdk";

import mic from '../../Assets/mic.svg';
import video1 from '../../Assets/video1.svg';
import micCut from '../../Assets/micCut.svg';
import videoCut from '../../Assets/videoCut.svg';
import callIcon from '../../Assets/call.svg';

// Video tile component using HMS React hooks
const VideoTile = ({ peer, isLocal = false, groupAudio = false }) => {
  const hmsActions = useHMSActions();
  const audioTrack = useHMSStore(selectAudioTrackByPeerID(peer.id));
  
  const { videoRef } = useVideo({
    trackId: peer.videoTrack
  });

  // Audio ref for HMS audio handling
  const audioRef = useRef(null);

  // Handle audio track attachment using HMS React SDK approach
  useEffect(() => {
    if (audioTrack && audioRef.current && !isLocal) {
      console.log(`Setting up audio for peer ${peer.name}`);
      
      // Use the HMS SDK's approach - directly set the srcObject
      try {
        if (audioTrack.enabled) {
          // Create MediaStream from the audio track
          audioRef.current.srcObject = new MediaStream([audioTrack]);
          
          // Try to play audio
          audioRef.current.play().catch(err => {
            if (err.name === 'NotAllowedError') {
              console.log(`Audio autoplay blocked for ${peer.name}`);
              // Set up user interaction handler
              const handleUserInteraction = () => {
                audioRef.current?.play().catch(() => {});
                document.removeEventListener('click', handleUserInteraction);
                document.removeEventListener('touchstart', handleUserInteraction);
              };
              document.addEventListener('click', handleUserInteraction, { once: true });
              document.addEventListener('touchstart', handleUserInteraction, { once: true });
            } else {
              console.error(`Audio play error for ${peer.name}:`, err);
            }
          });
          
          console.log(`✅ Audio setup completed for ${peer.name}`);
        }
      } catch (err) {
        console.error(`❌ Audio setup error for ${peer.name}:`, err);
      }
    }

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.srcObject = null;
      }
    };
  }, [audioTrack, peer.name, isLocal]);

  return (
    <div className={styles.videoContainer}>
      {/* Audio element - for remote peers only */}
      {audioTrack && !isLocal && (
        <audio
          ref={audioRef}
          autoPlay
          playsInline
          style={{ display: 'none' }}
        />
      )}
      
      {/* Video element - HMS handles attachment automatically */}
      {!groupAudio && peer.videoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal} // Mute local video to prevent echo
          playsInline
          className={styles.video}
          style={{
            transform: isLocal ? 'scaleX(-1)' : 'none', // Mirror local video
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            backgroundColor: '#000'
          }}
        />
      ) : (
        <div className={styles.noVideo}>
          <div className={styles.avatarCircle}>
             <span>{peer.name[0]?.toUpperCase()}</span>
          </div>
          {groupAudio ? <span>Audio Call</span> : <span>No Video</span>}
        </div>
      )}
      
      <div className={styles.peerName}>
        <span>{peer.name} {isLocal ? '(You)' : ''}</span>
      </div>
    </div>
  );
};

// Main call interface component
const CallInterface = () => {
  // HMS hooks
  const hmsActions = useHMSActions();
  const peers = useHMSStore(selectPeers);
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const isLocalAudioEnabled = useHMSStore(selectIsLocalAudioEnabled);
  const isLocalVideoEnabled = useHMSStore(selectIsLocalVideoEnabled);
  const localPeer = useHMSStore(selectLocalPeer);
  const peerCount = useHMSStore(selectPeerCount);

  // Redux state
  const { groupCall, groupCallIncoming, groupAudio } = useSelector(state => state.groupcallReducer);
  const { groupChat } = useSelector(state => state.groupReducer);
  const { user } = useSelector(state => state.userReducer);
  const dispatch = useDispatch();

  // Component state
  const [callInstance, setCallInstance] = useState(false);
  const [roomToken, setRoomToken] = useState(null);
  const [roomUrl, setRoomUrl] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [sender, setSender] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  
  // New state to prevent duplicate operations
  const [callInitiated, setCallInitiated] = useState(false);
  const [joinAttempted, setJoinAttempted] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth * 0.075, // Center it roughly
    y: window.innerHeight * 0.075,
  });
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Refs to prevent duplicate operations
  const joinInProgressRef = useRef(false);
  const callStartedRef = useRef(false);

  const handleMouseDown = (e) => {
    // Only drag from container/wrapper, not buttons
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

      // Keep within reasonable bounds
      const boundedX = Math.max(0, Math.min(newX, window.innerWidth - 100));
      const boundedY = Math.max(0, Math.min(newY, window.innerHeight - 100));

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

  // Register user with socket
  useEffect(() => {
    if (user?._id) {
      socket.emit('register-user', user._id);
    }
  }, [user]);

  // Handle connection state changes
  useEffect(() => {
    if (isConnected) {
      console.log('✅ Connected to HMS room');
      setCallInstance(true);
      setIsJoining(false);
      joinInProgressRef.current = false;
    } else if (callInstance && !isLeaving) {
      console.log('❌ Disconnected from HMS room unexpectedly');
      // Only reset if we're not intentionally leaving
      setTimeout(() => {
        if (!isLeaving) {
          handleConnectionLoss();
        }
      }, 1000);
    }
  }, [isConnected, callInstance, isLeaving]);

  // Handle connection loss
  const handleConnectionLoss = useCallback(() => {
    console.log('Handling connection loss...');
    setCallInstance(false);
    setIsJoining(false);
    setJoinAttempted(false);
    joinInProgressRef.current = false;
    dispatch(endCall());
  }, [dispatch]);

  // Handle peer count changes
  useEffect(() => {
    console.log(`Peer count: ${peerCount}`);
  }, [peerCount]);

  // Socket event handlers
  useEffect(() => {
    const handleInitiatedGroupCall = ({ roomName, token, url, roomId: rId }) => {
      console.log('Group call initiated:', { roomName, hasToken: !!token, url, roomId: rId });
      
      // Prevent duplicate processing
      if (joinInProgressRef.current || joinAttempted) {
        console.log('Join already in progress, ignoring duplicate event');
        return;
      }

      setRoomToken(token);
      setRoomUrl(url);
      setRoomId(rId);
      
      // Auto-join for initiated calls with a small delay
      setTimeout(() => {
        if (!joinInProgressRef.current && !joinAttempted) {
          joinRoom(token);
        }
      }, 500);
    };

    const handleIncomingGroupCall = ({ roomName, token, url, audio, sender: s, roomId: rId }) => {
      console.log('Incoming group call:', { roomName, hasToken: !!token, url, audio, sender: s, roomId: rId });
      
      setRoomToken(token);
      setRoomUrl(url);
      setRoomId(rId);
      setSender(s);
      dispatch(makeGroupIncoming());
      if (audio) {
        dispatch(audioGroupCall());
      }
    };

    const handleGroupCallError = (error) => {
      console.error('Group call error:', error);
      resetCallState();
    };

    socket.on('group-call-initiated', handleInitiatedGroupCall);
    socket.on('incoming-group-call', handleIncomingGroupCall);
    socket.on('group-call-error', handleGroupCallError);
    
    return () => {
      socket.off('group-call-initiated', handleInitiatedGroupCall);
      socket.off('incoming-group-call', handleIncomingGroupCall);
      socket.off('group-call-error', handleGroupCallError);
    };
  }, [dispatch, joinAttempted]);

  // Reset call state helper
  const resetCallState = useCallback(() => {
    setCallInstance(false);
    setIsJoining(false);
    setJoinAttempted(false);
    setCallInitiated(false);
    setIsLeaving(false);
    joinInProgressRef.current = false;
    callStartedRef.current = false;
    dispatch(endCall());
  }, [dispatch]);

  // Start call function - FIXED with better error handling and logging
  const startCall = useCallback(() => {
    console.log('startCall function called');
    console.log('Current state:', {
      groupChat: groupChat ? {
        name: groupChat.name,
        Users: groupChat.Users,
        UsersLength: groupChat.Users?.length
      } : null,
      userId: user?._id,
      groupAudio,
      callStartedRef: callStartedRef.current
    });

    // More detailed validation with specific error messages
    if (!groupChat) {
      console.error('❌ No group chat available');
      return;
    }

    if (!groupChat.Users) {
      console.error('❌ No users array in group chat');
      return;
    }

    if (!Array.isArray(groupChat.Users)) {
      console.error('❌ Group chat Users is not an array:', typeof groupChat.Users);
      return;
    }

    if (groupChat.Users.length === 0) {
      console.error('❌ Group chat Users array is empty');
      return;
    }

    if (!user?._id) {
      console.error('❌ No user ID available:', user);
      return;
    }

    if (callStartedRef.current) {
      console.log('❌ Call already started, preventing duplicate');
      return;
    }

    console.log('✅ All validations passed, starting group call...');
    callStartedRef.current = true;
    
    const callData = { 
      group: groupChat.Users, 
      user: user._id, 
      audio: groupAudio, 
      sender: groupChat.name 
    };
    
    console.log('Emitting initiate-group-call with data:', callData);
    socket.emit('initiate-group-call', callData);
  }, [groupChat, user, groupAudio]);

  // Start call when groupCall state changes - with duplicate prevention
  useEffect(() => {
    console.log('useEffect for starting call triggered:', {
      groupCall,
      groupCallIncoming,
      callInitiated,
      callStartedRef: callStartedRef.current
    });

    if (groupCall && !groupCallIncoming && !callInitiated && !callStartedRef.current) {
      console.log("✅ Conditions met for starting call");
      setCallInitiated(true);
      startCall();
    }
  }, [groupCall, groupCallIncoming, callInitiated, startCall]);

  // Join room function using HMS React SDK
  const joinRoom = async (authToken) => {
    if (joinInProgressRef.current || isJoining || joinAttempted || !authToken) {
      console.log('Join operation already in progress or invalid token');
      return;
    }

    joinInProgressRef.current = true;
    setIsJoining(true);
    setJoinAttempted(true);

    try {
      console.log('Joining HMS room...');
      
      // Use HMS React SDK join method
      await hmsActions.join({
        userName: user?.name || `User-${Date.now()}`,
        authToken,
        settings: {
          isAudioMuted: false,
          isVideoMuted: groupAudio || false, // Mute video for audio-only calls
        }
      });

      console.log('✅ Successfully joined HMS room');
      
    } catch (error) {
      console.error('❌ Error joining room:', error);
      resetCallState();
    }
  };

  // Handle accept call
  const handleAccept = async () => {
    console.log('Accepting call...');
    if (roomToken && !joinInProgressRef.current) {
      dispatch(makeGroupCall());
      await joinRoom(roomToken);
    }
  };

  // Toggle audio using HMS actions
  const toggleAudio = async () => {
    try {
      await hmsActions.setLocalAudioEnabled(!isLocalAudioEnabled);
      console.log('Audio toggled:', !isLocalAudioEnabled);
    } catch (error) {
      console.error('Error toggling audio:', error);
    }
  };

  // Toggle video using HMS actions
  const toggleVideo = async () => {
    try {
      await hmsActions.setLocalVideoEnabled(!isLocalVideoEnabled);
      console.log('Video toggled:', !isLocalVideoEnabled);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  // Handle reject call
  const handleReject = () => {
    console.log('Rejecting call');
    resetCallState();
  };

  // Leave call function - improved with proper state management
  const handleLeaveCall = async () => {
    if (isLeaving) {
      console.log('Leave operation already in progress');
      return;
    }

    setIsLeaving(true);

    try {
      console.log('Leaving call...');

      // Leave HMS room
      if (isConnected) {
        await hmsActions.leave();
        console.log('✅ Left HMS room');
      }
      
      // Send room deletion request
      if (roomId || roomUrl || roomToken) {
        console.log('Requesting room deletion...');
        socket.emit("DeleteCallRoom", { 
          roomUrl, 
          roomToken,
          roomId
        });
      }
      
      console.log('✅ Call ended successfully');
    } catch (error) {
      console.error('❌ Error leaving call:', error);
    } finally {
      // Reset all state
      setCallInstance(false);
      setRoomToken(null);
      setRoomUrl(null);
      setRoomId(null);
      setIsJoining(false);
      setJoinAttempted(false);
      setCallInitiated(false);
      setIsLeaving(false);
      joinInProgressRef.current = false;
      callStartedRef.current = false;
      dispatch(endCall());
    }
  };

  // Room deletion handlers
  useEffect(() => {
    const handleRoomDeleted = ({ roomId, success }) => {
      console.log('✅ Room deletion confirmed:', roomId, success);
    };

    const handleRoomDeletionFailed = ({ roomId, error, details }) => {
      console.error('❌ Room deletion failed:', roomId, error, details);
    };

    socket.on('room-deleted', handleRoomDeleted);
    socket.on('room-deletion-failed', handleRoomDeletionFailed);

    return () => {
      socket.off('room-deleted', handleRoomDeleted);
      socket.off('room-deletion-failed', handleRoomDeletionFailed);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected && !isLeaving) {
        hmsActions.leave().catch(console.error);
      }
    };
  }, []);



  // Show incoming call UI
  if (groupCallIncoming && !groupCall) {
    return (
      <div 
        className={`${styles.incoming} ${isDragging ? styles.dragging : ""}`}
        onMouseDown={handleMouseDown}
        style={{
          position: "fixed",
          top: position.y,
          left: position.x,
          transform: "none",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <div className={styles.info}>
          <span>Spider-Signal Detected</span>
          <span>{sender}</span>
        </div>
        <div className={styles.acceptReject}>
           <button onClick={handleReject} className={styles.reject} title="Reject">
            <img src={callIcon} alt="reject" />
          </button>
          <button onClick={handleAccept} className={styles.accept} title="Accept">
            <img src={callIcon} alt="accept" />
          </button>
        </div>
      </div>
    );
  }

  // Show call UI
  if (groupCall) {
    return (
      <div 
        className={`${styles.main} ${isDragging ? styles.dragging : ""}`}
        onMouseDown={handleMouseDown}
        style={{
          position: "fixed",
          top: position.y,
          left: position.x,
          transform: "none", // Override the center transform
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <div className={styles.callInfo}>
           {isConnected ? "Connection Secure" : "Establishing Link..."}
        </div>

        <div className={styles.videoWrapper}>
          {isJoining || (!isConnected && !isLeaving) ? (
            <div className={styles.loading}>
              <span>Joining the Society...</span>
            </div>
          ) : peers.length === 0 ? (
            <div className={styles.loading}>
              <span>Scanning for local signals...</span>
            </div>
          ) : (
            peers.map((peer) => (
              <VideoTile 
                key={peer.id} 
                peer={peer} 
                isLocal={peer.isLocal}
                groupAudio={groupAudio}
              />
            ))
          )}
        </div>

        <div className={styles.controls}>
          <button 
            onClick={toggleAudio} 
            style={{ opacity: !isLocalAudioEnabled ? '0.5' : '1' }}
            title={!isLocalAudioEnabled ? 'Unmute' : 'Mute'}
            disabled={!isConnected}
          >
            <img src={!isLocalAudioEnabled ? micCut : mic} alt="mic" />
          </button>
          
          {!groupAudio && (
            <button 
              onClick={toggleVideo} 
              style={{ opacity: !isLocalVideoEnabled ? '0.5' : '1' }}
              title={!isLocalVideoEnabled ? 'Start Video' : 'Stop Video'}
              disabled={!isConnected}
            >
              <img src={!isLocalVideoEnabled ? videoCut : video1} alt="video" />
            </button>
          )}
          
          <button 
            onClick={handleLeaveCall} 
            className={styles.endCall}
            disabled={isLeaving}
          >
            {isLeaving ? 'Cutting Line...' : 'End Call'}
          </button>
        </div>
      </div>
    );
  }

  return null;
};


// Main GroupCall component with HMS Provider
const GroupCall = () => {
  return (
    <HMSRoomProvider>
      <CallInterface />
    </HMSRoomProvider>
  );
};

export default GroupCall;