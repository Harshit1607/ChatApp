// import dotenv from 'dotenv';
// import axios from 'axios';
// import express from 'express';
// dotenv.config();


// const router = express.Router();
// const DAILY_API_KEY = process.env.DAILY_CO;
// const DAILY_API_URL = 'https://api.daily.co/v1';

// // Create a new room
// const createRoom = async () => {
//   try {
//     const response = await axios.post(
//       `${DAILY_API_URL}/rooms`,
//       {
//         properties: {
//           enable_screenshare: true,
//           enable_chat: true,
//           start_video_off: false,
//           start_audio_off: false,
//         },
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${DAILY_API_KEY}`,
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error creating room:', error);
//     throw error;
//   }
// };

// // Generate a meeting token
// const createMeetingToken = async (roomName) => {
//   try {
//     const response = await axios.post(
//       `${DAILY_API_URL}/meeting-tokens`,
//       {
//         properties: {
//           room_name: roomName,
//           exp: Math.floor(Date.now() / 1000) + 3600, // Token expires in 1 hour
//         },
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${DAILY_API_KEY}`,
//         },
//       }
//     );
//     return response.data.token;
//   } catch (error) {
//     console.error('Error creating meeting token:', error);
//     throw error;
//   }
// };

// export const dailycoSocket = (io) => {
//   io.on('connection', (socket) => {
//       console.log('Socket connected:', socket.id);

//       // Handle group call initiation
//         socket.on('initiate-group-call', async ({group, user}) => {
//           try {
//             // Create a new room
//             const room = await createRoom();
            
//             // Generate a token for the room
//             const token = await createMeetingToken(room.name);

//             // Emit room details to initiator
//             socket.emit('group-call-initiated', {
//               roomName: room.name,
//               token,
//               url: room.url,
//             });

//             // Notify other participants
//             group.Users.forEach(participantId => {
//               console.log(participantId)
//               socket.to(participantId).emit('incoming-group-call', {
//                 roomName: room.name,
//                 token,
//                 url: room.url,
//                 initiator: user,
//               });
//             });
//           } catch (error) {
//             console.error('Error initiating group call:', error);
//             socket.emit('group-call-error', {
//               message: 'Failed to initiate group call',
//             });
//           }
//         });
//     });
// };