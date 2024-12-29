import { Server } from 'socket.io';
import http from 'http';

// Export the io instance and server for use in other files
export const initSocketServer = (app, corsOptions) => {
  const server = http.createServer(app);  // Create HTTP server from Express app
  const io = new Server(server, {
    pingTimeout: 100000, // Timeout if no ping received within 60 seconds
    cors: corsOptions,  // Apply CORS options for sockets
  });
  
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return { server, io };
};

