import dotenv from 'dotenv';
import axios from 'axios';
import express from 'express';
dotenv.config();


const router = express.Router();
const DAILY_API_KEY = process.env.DAILY_CO;
const DAILY_API_URL = 'https://api.daily.co/v1';

// Create a new room
const createRoom = async () => {
  try {
    const response = await axios.post(
      `${DAILY_API_URL}/rooms`,
      {
        properties: {
          enable_screenshare: true,
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

// Generate a meeting token
const createMeetingToken = async (roomName) => {
  try {
    const response = await axios.post(
      `${DAILY_API_URL}/meeting-tokens`,
      {
        properties: {
          room_name: roomName,
          exp: Math.floor(Date.now() / 1000) + 3600, // Token expires in 1 hour
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
      }
    );
    return response.data.token;
  } catch (error) {
    console.error('Error creating meeting token:', error);
    throw error;
  }
};

const deleteRoom = async (roomName) => {
  try {
    const response = await axios.delete(
      `${DAILY_API_URL}/rooms/${roomName}`,
      {
        headers: {
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
      }
    );
    console.log(`Room ${roomName} deleted successfully`);
    return response.data;
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};


export const dailycoSocket = (io) => {
  io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);

      // Handle group call initiation
        socket.on('initiate-group-call', async ({group, user, audio}) => {
          try {
            // Create a new room
            const room = await createRoom();
            
            // Generate a token for the room
            const token = await createMeetingToken(room.name);
            
            // Emit room details to initiator
            socket.emit('group-call-initiated', {
              roomName: room.name,
              token,
              url: room.url
              
            });

            // Notify other participants
            group.forEach(participantId => {
              if(participantId !== user){
                console.log(participantId)
              socket.to(participantId).emit('incoming-group-call', {
                roomName: room.name,
                token,
                url: room.url,
                initiator: user,
                audio
              });
}

            });
          } catch (error) {
            console.error('Error initiating group call:', error);
            socket.emit('group-call-error', {
              message: 'Failed to initiate group call',
            });
          }
        });
        socket.on("DeleteCallRoom", async ({roomUrl, roomToken})=>{
          const roomName = roomUrl.split('/').pop();

        // Validate room token (optional, depends on your use case)
      

        // Delete the room
        await deleteRoom(roomName);

        })
    });
};