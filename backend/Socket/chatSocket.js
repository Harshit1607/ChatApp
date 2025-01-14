import { createNewChat, getLatestChat, newChat, viewChat } from "../Controllers/chatController.js";
import { getGroup } from "../Controllers/groupController.js";
import { checkUserOnline } from "../Controllers/userController.js";



export const chatSocket = (io) =>{
  io.on('connection',(socket)=>{
    console.log('Socket connected:', socket.id);
  
    // Handle the 'newChat' event
    socket.on('newChat', async ({ text, user, group }) => {
      try {
        // Call the newChat controller function to save the new chat
        const newChatData = await createNewChat({ text, user, group });

        const GroupData = await getGroup(group);
        
        GroupData.Users.forEach(each=>{
          const sent = each.toString();
          
          socket.to(sent).emit("new message", { newChat: newChatData })
        })
        io.in(user).emit("new message", { newChat: newChatData })
      } catch (error) {
        console.error('Error while saving chat:', error);
        socket.emit('error', 'Unable to send chat');
      }
  })

  socket.on('latestChat', async ({ group }) => {
    if (!group) {
      console.error("Invalid group data received.");
      return;
    }
  
    try {
      const message = await getLatestChat({ group });
  
      // Emit the message back to the client
      if (message) {
        socket.emit("latestChat", { message });
      } else {
        console.log("No messages found for this group.");
      }
    } catch (error) {
      console.error("Error fetching latest chat:", error);
    }
  });

  socket.on('viewChat', async ({group, user})=>{
    if (!group || !user) {
      console.error("Invalid data received.");
      return;
    }
    try {
      const viewedChats = await viewChat({group, user});
      if(viewedChats){
        io.in(group).emit("viewChat", { viewedChats });
      }
    } catch (error) {
      console.error("Error viewing chat:", error);
    }
  })

  socket.on('typing', ({group, user}) => {
    socket.to(group).emit('typing', { typing: true, by: user});
  });
  
  socket.on('stop typing', ({group, user}) => {
    socket.to(group).emit('stop typing', { typing: false, by: user });
  });

  socket.on('checkUser', async (user) =>{
    if(!user){
      console.log("Invalid data")
      return;
    }try {
      // const {status, lastSeen} = await checkUserOnline(user);
      socket.emit('checkUser', {status: "online", lastSeen: "Lo"});
    } catch (error) {
      console.error("Error checking:", error);
    }
  })

  });
}
