import { markUserOnline } from "../Controllers/userController.js";

export const groupSocket = (io) =>{
  io.on('connection',(socket)=>{
    console.log('Socket connected:', socket.id);
  
    socket.on('joinGroup', (data) => {
      if (data && data.group) {
        socket.join(data.group);
        console.log(`User ${data.user} joined group ${data.group}`);
      } else {
        console.error('Invalid data received for joinGroup:', data);
      }
    });

    socket.on('joinUser', async (data) => {
      if (data) {
        socket.userId = data
        socket.join(data);
        markUserOnline(data);
        console.log(`User ${data} joined group ${data}`);
      } else {
        console.error('Invalid data received for joinUser:', data);
      }
    });
    socket.on('leaveGroup', (data) => {
    
      if (data) {
        socket.leave(data);
        console.log(`User  left group ${data}`);
      } else {
        console.error('Invalid data received for leaveGroup');
      }
    });
    
  })
}

