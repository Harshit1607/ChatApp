export const webrtcSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected for WebRTC:', socket.id);

    socket.on('sendOffer', ({ offer, recipient, user }) => {
      if (!offer || !recipient || !user) {
        console.error('Invalid data for sendOffer');
        return;
      }
      
      socket.to(recipient).emit('receiveOffer', { offer, sender: user });
    
    });

    socket.on('sendAnswer', ({ answer, sender, offer }) => {
      if (!answer || !sender) {
        console.error('Invalid data for callAccepted');
        return;
      }
      console.log(`Call accepted by recipient, sending answer to ${sender._id}`);
      socket.to(sender._id).emit('receiveAnswer', { answer, offer });
    });

    // When the recipient rejects the call
    socket.on('callRejected', ({ sender }) => {
      if (!sender) {
        console.error('Invalid data for callRejected');
        return;
      }
      console.log(`Call rejected by recipient, notifying ${sender}`);
      socket.to(sender._id).emit('callRejected');
    });

    socket.on('sendCandidate', ( ({ candidate, recipient } ) => {
      if (!candidate || !recipient) {
        console.error('Invalid data for sendCandidate');
        return;
      }
      console.log(`ICE Candidate sent to ${recipient}`);
      socket.to(recipient).emit('receiveCandidate', { candidate });
    }));

    socket.on('endCall', ({ recipient }) => {
      if (!recipient) {
        console.error('Invalid data for call end');
        return;
      }
      console.log(`Call ended by recipient, notifying ${recipient}`);
      socket.to(recipient).emit('endCall');
    });

    socket.on('audioMute', ({ recipient, isMuted }) => {
      if (!recipient) {
        console.error('Invalid data for call end');
        return;
      }
      console.log(`audio muted, notifying ${recipient}`);
      socket.to(recipient).emit('audioMute', {isMuted});
    });

    socket.on('videoStop', ({ recipient, isStopped }) => {
      if (!recipient) {
        console.error('Invalid data for call end');
        return;
      }
      console.log(`video stopped, notifying ${recipient}`);
      socket.to(recipient).emit('videoStop', {isStopped});
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected from WebRTC:', socket.id);
    });
  });
};