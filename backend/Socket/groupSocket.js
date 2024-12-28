
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
    
  })
}

