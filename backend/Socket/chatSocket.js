import { createNewChat, newChat } from "../Controllers/chatController.js";



export const chatSocket = (io) =>{
  io.on('connection',(socket)=>{
    console.log('Socket connected:', socket.id);
  
    // Handle the 'newChat' event
    socket.on('newChat', async ({ text, user, group }) => {
      try {
        // Call the newChat controller function to save the new chat
        const newChatData = await createNewChat({ text, user, group });
        // Emit the new chat message to the group
        io.in(group._id).emit("new message", { newChat: newChatData });
      } catch (error) {
        console.error('Error while saving chat:', error);
        socket.emit('error', 'Unable to send chat');
      }
  })
  });
}
