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