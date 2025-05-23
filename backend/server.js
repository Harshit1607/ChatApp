import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { connectDb } from './Database/db.js';
import { corsMiddleware, corsOptions } from './Middlewares/CorsMiddlewares.js';
import userRoutes from './Routes/userRoutes.js';
import homeRoutes from './Routes/homeRoutes.js';
import groupRoutes from './Routes/groupRoutes.js';
import chatRoutes from './Routes/chatRoutes.js';
import translationRoutes from './Routes/translationRoutes.js'
import { initSocketServer } from './Socket/socket.js';  // Import the function to initialize socket server
import { chatSocket } from './Socket/chatSocket.js';
import { groupSocket } from './Socket/groupSocket.js';
import { redisClient } from './redis.js'; // Import the Redis client
import { webrtcSocket } from './Socket/webrtcSocket.js';
import { hmsVideoSocket } from './Socket/dailycoSocket.js';


dotenv.config();

const app = express();
// const port = process.env.PORT || 5000;

app.use(bodyParser.json({ limit: '10mb' })); // Set limit for JSON bodies (10MB)
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' })); // Set limit for URL-encoded bodies (10MB)

app.use(corsMiddleware);  // Apply CORS middleware
app.options('*', corsMiddleware);  // Handle preflight requests for all routes

connectDb();

app.use('/', homeRoutes);
app.use('/user', userRoutes);
app.use('/group', groupRoutes);
app.use('/chat', chatRoutes);
app.use('/translation', translationRoutes)


redisClient.on('connect', () => {
  console.log('Redis is connected in server.js');
});

// Initialize the socket server by passing the Express app and CORS options
const { server, io } = initSocketServer(app, corsOptions);

groupSocket(io);
chatSocket(io);
webrtcSocket(io);
hmsVideoSocket(io);

// Export the server for listening later
export { server, io };
