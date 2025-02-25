import socket from "./Socket";

// Function to send a new chat message via socket
export const sendNewChat = (text, user, group, isMedia) => {
  socket.emit('newChat', { text, user, group,isMedia });
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


export const viewChat = (group, user) =>{
  socket.emit('viewChat', {group, user})
}

export const typingIndi = (group, user) =>{
  
  socket.emit("typing", {group, user})
}

export const stopTyping = (group, user) =>{
  socket.emit("stop typing", {group, user})
}

export const otherTyping = (callback) => {
  const handleTyping = ({ typing, by }) => {
    
    callback(typing, by); // Pass typing state and user info
  };
;
  socket.on('typing', handleTyping);

  return () => {
    socket.off('typing', handleTyping);
  };
};

export const otherStopTyping = (callback) => {
  const handleStopTyping = ({ typing, by }) => {
  
    callback(typing, by); // Pass typing state and user info
  };

  socket.on('stop typing', handleStopTyping);

  return () => {
    socket.off('stop typing', handleStopTyping);
  };
};

export const checkUser = (user)=>{
  socket.emit("checkUser", (user));
}