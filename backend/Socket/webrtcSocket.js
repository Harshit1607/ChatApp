export const webrtcSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected for WebRTC:', socket.id);

     // Send offer
     socket.on('sendOffer', ({ offer, recipient, user, audio }) => {
      if (!offer || !recipient || !user) {
        console.error('Invalid data for sendOffer');
        return;
      }
      socket.to(recipient).emit('receiveOffer', { offer, sender: user, audioOnly: audio });
    });

    // Send answer
    socket.on('sendAnswer', ({ answer, sender }) => {
      if (!answer || !sender) {
        console.error('Invalid data for sendAnswer');
        return;
      }
      socket.to(sender).emit('receiveAnswer', { answer });
    });

    // ICE Candidate exchange
    socket.on('sendCandidate', ({ candidate, recipient }) => {
      if (!candidate || !recipient) {
        console.error('Invalid data for sendCandidate');
        return;
      }
      socket.to(recipient).emit('receiveCandidate', { candidate });
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