import socket from "./Socket";

// Function to send a new chat message via socket
export const sendNewChat = (text, user, group) => {
  socket.emit('newChat', { text, user, group });
};


// Function to listen for error messages
export const onNewChatError = (callback) => {
  socket.on('error', (errorMessage) => {
    callback(errorMessage);
  });
};

export const getLatestChat = (group) =>{
  socket.emit('latestChat', {group})
}

export const onLatestChat = (callback) => {
  const handleLatestChat = ({ message }) => {
    callback(message); // Pass the message to the provided callback
  };

  // Register the listener
  socket.on('latestChat', handleLatestChat);

  // Return a cleanup function to remove the listener
  return () => {
    socket.off('latestChat', handleLatestChat);
  };
};