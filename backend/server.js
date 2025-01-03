import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { connectDb } from './Database/db.js';
import { corsMiddleware, corsOptions } from './Middlewares/CorsMiddlewares.js';
import userRoutes from './Routes/userRoutes.js';
import homeRoutes from './Routes/homeRoutes.js';
import groupRoutes from './Routes/groupRoutes.js';
import chatRoutes from './Routes/chatRoutes.js';
import { initSocketServer } from './Socket/socket.js';  // Import the function to initialize socket server
import { chatSocket } from './Socket/chatSocket.js';
import { groupSocket } from './Socket/groupSocket.js';
import { redisClient } from './redis.js'; // Import the Redis client
import { webrtcSocket } from './Socket/webrtcSocket.js';

dotenv.config();

const app = express();
// const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(corsMiddleware);  // Apply CORS middleware
app.options('*', corsMiddleware);  // Handle preflight requests for all routes

connectDb();

app.use('/', homeRoutes);
app.use('/user', userRoutes);
app.use('/group', groupRoutes);
app.use('/chat', chatRoutes);



redisClient.on('connect', () => {
  console.log('Redis is connected in server.js');
});

// Initialize the socket server by passing the Express app and CORS options
const { server, io } = initSocketServer(app, corsOptions);

groupSocket(io);
chatSocket(io);
webrtcSocket(io);

// Export the server for listening later
export { server, io };
