import { markUserOnline } from "../Controllers/userController.js";

export const groupSocket = (io) =>{
  io.on('connection',(socket)=>{
    console.log('Socket connected:', socket.id);
  
    socket.on('joinGroup', (data) => {
      if (data && data.group && data.group._id) {
        socket.join(data.group._id);
        console.log(`User ${data.user._id} joined group ${data.group._id}`);
      } else {
        console.error('Invalid data received for joinGroup:', data);
      }
    });

    socket.on('joinUser', async (data) => {
      if (data && data._id) {
        socket.userId = data._id
        socket.join(data._id);
        markUserOnline(data);
        console.log(`User ${data._id} joined group ${data._id}`);
      } else {
        console.error('Invalid data received for joinUser:', data);
      }
    });
    socket.on('leaveGroup', (data) => {
    
      if (data && data._id) {
        socket.leave(data._id);
        console.log(`User  left group ${data._id}`);
      } else {
        console.error('Invalid data received for leaveGroup');
      }
    });
    
  })
}

