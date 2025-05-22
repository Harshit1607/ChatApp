// hmsVideoSocket.js - Fixed Backend Code
import dotenv from 'dotenv';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

// Get environment variables
const HMS_APP_ACCESS_KEY = process.env.HMS_APP_ACCESS_KEY?.trim();
const HMS_APP_SECRET = process.env.HMS_APP_SECRET?.trim();
const HMS_TEMPLATE_ID = process.env.HMS_TEMPLATE_ID?.trim();
const HMS_API_URL = 'https://api.100ms.live/v2';

console.log('HMS Config Check:');
console.log('- Access Key set:', !!HMS_APP_ACCESS_KEY);
console.log('- Secret length:', HMS_APP_SECRET?.length || 0);
console.log('- Template ID:', HMS_TEMPLATE_ID);

// Store active rooms for cleanup
const activeRooms = new Map();

// Utility function to decode and check HMS tokens
const checkTokenValidity = (token) => {
  try {
    const decoded = jwt.decode(token);
    console.log('Token details:', {
      role: decoded.role,
      roomId: decoded.room_id,
      userId: decoded.user_id,
      expires: new Date(decoded.exp * 1000).toISOString(),
      isExpired: decoded.exp < (Date.now() / 1000)
    });
    
    if (decoded.exp < (Date.now() / 1000)) {
      console.error('⚠️ Token is expired!');
      return false;
    }
    
    const requiredFields = ['access_key', 'room_id', 'user_id', 'role', 'type', 'version'];
    const missingFields = requiredFields.filter(field => !decoded[field]);
    
    if (missingFields.length > 0) {
      console.error('⚠️ Token is missing required fields:', missingFields);
      return false;
    }
    
    console.log('✓ Token appears valid (format check only)');
    return true;
  } catch (error) {
    console.error('Error decoding token:', error);
    return false;
  }
};

// Generate a management token
const generateManagementToken = () => {
  if (!HMS_APP_ACCESS_KEY || !HMS_APP_SECRET) {
    throw new Error('HMS credentials not properly configured. Check your environment variables.');
  }

  const payload = {
    access_key: HMS_APP_ACCESS_KEY,
    type: 'management',
    version: 2,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    jti: uuidv4(),
  };

  const cleanSecret = HMS_APP_SECRET.replace(/^["']|["']$/g, '');

  try {
    return jwt.sign(payload, cleanSecret, { algorithm: 'HS256' });
  } catch (error) {
    console.error('Error generating management token:', error);
    throw new Error('Failed to generate HMS management token. Check your secret key.');
  }
};

// Test HMS connection
const testHMSConnection = async () => {
  try {
    console.log('🔍 Testing HMS connection...');
    const managementToken = generateManagementToken();
    
    const response = await axios.get(`${HMS_API_URL}/templates`, {
      headers: {
        'Authorization': `Bearer ${managementToken}`,
      },
      timeout: 10000
    });
    
    console.log('✅ HMS connection successful');
    console.log('Available templates:', response.data.data?.length || 0);
    
    // Check if our template exists
    if (HMS_TEMPLATE_ID && response.data.data) {
      const template = response.data.data.find(t => t.id === HMS_TEMPLATE_ID);
      if (template) {
        console.log('✅ Template found:', template.name);
        return true;
      } else {
        console.log('❌ Template not found. Available templates:');
        response.data.data.forEach(t => console.log(`  - ${t.id}: ${t.name}`));
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ HMS connection failed:', error.response?.data || error.message);
    return false;
  }
};

// Get room details
const getRoomDetails = async (roomId) => {
  try {
    const managementToken = generateManagementToken();
    
    const response = await axios.get(`${HMS_API_URL}/rooms/${roomId}`, {
      headers: {
        'Authorization': `Bearer ${managementToken}`,
      },
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching room ${roomId} details:`, error.response?.data || error.message);
    throw error;
  }
};

// Create a new room with fallback strategies
const createRoom = async () => {
  try {
    const managementToken = generateManagementToken();
    const roomName = `Room-${Date.now()}`;

    console.log('Creating new HMS room...');

    let roomData = {
      name: roomName,
      description: "Group call room",
      region: "in"
    };

    // Strategy 1: Try with template if available
    if (HMS_TEMPLATE_ID) {
      console.log('Attempting with template:', HMS_TEMPLATE_ID);
      roomData.template_id = HMS_TEMPLATE_ID;
      
      try {
        const response = await axios.post(`${HMS_API_URL}/rooms`, roomData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${managementToken}`,
          },
          timeout: 15000
        });

        console.log('✅ Room created with template:', response.data.id);
        return {
          id: response.data.id,
          name: response.data.name,
        };
      } catch (templateError) {
        console.log('❌ Template creation failed:', templateError.response?.data || templateError.message);
        console.log('Falling back to default room creation...');
      }
    }

    // Strategy 2: Create without template (fallback)
    delete roomData.template_id;
    
    const response = await axios.post(`${HMS_API_URL}/rooms`, roomData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managementToken}`,
      },
      timeout: 15000
    });

    console.log('✅ Room created without template:', response.data.id);
    return {
      id: response.data.id,
      name: response.data.name,
    };

  } catch (error) {
    console.error('❌ Room creation failed completely:', error.response?.data || error.message);
    throw new Error(`Failed to create HMS room: ${error.message}`);
  }
};

// Generate app token with better error handling
const createAppToken = async (roomId, role = "guest", userId) => {
  if (!roomId) {
    throw new Error('Room ID is required to create app token');
  }

  const payload = {
    access_key: HMS_APP_ACCESS_KEY,
    room_id: roomId,
    user_id: userId || `user-${Date.now()}`,
    role, 
    type: 'app',
    version: 2,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 2 * 60 * 60, // 2 hours
    jti: uuidv4(),
  };

  const cleanSecret = HMS_APP_SECRET.replace(/^["']|["']$/g, '');

  try {
    const token = jwt.sign(payload, cleanSecret, { algorithm: 'HS256' });
    
    console.log(`Generated token for role "${role}" and user "${userId}"`);
    checkTokenValidity(token);
    
    return token;
  } catch (error) {
    console.error('Error generating app token:', error);
    throw new Error('Failed to generate HMS app token');
  }
};

// End active session in room (kick all users)
const endActiveSession = async (roomId) => {
  try {
    const managementToken = generateManagementToken();

    console.log(`Attempting to end active session for room ${roomId}`);
    
    const response = await axios.post(`${HMS_API_URL}/active-rooms/${roomId}/end-room`, {}, {
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log(`✅ Active session ended for room ${roomId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error ending active session for room ${roomId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Delete a room with improved error handling
const deleteRoom = async (roomId) => {
  if (!roomId) {
    throw new Error('Room ID is required to delete a room');
  }

  try {
    const managementToken = generateManagementToken();

    console.log(`Attempting to delete room ${roomId}`);
    
    // First, try to end any active sessions
    try {
      await endActiveSession(roomId);
      console.log('Active session ended, proceeding with room deletion...');
      // Wait a bit for the session to fully end
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (sessionError) {
      console.log('No active session or session end failed, proceeding with deletion...');
    }
    
    // Try to delete the room
    try {
      const response = await axios.delete(`${HMS_API_URL}/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${managementToken}`,
        },
        timeout: 10000
      });
      console.log(`✅ Room ${roomId} deleted successfully`);
      return response.data;
    } catch (deleteError) {
      // If direct deletion fails, try to get room status first
      console.log('Direct deletion failed, checking room status...');
      
      try {
        const roomDetails = await getRoomDetails(roomId);
        console.log('Room details:', roomDetails);
        
        // If room is enabled, try to disable it first
        if (roomDetails.enabled) {
          console.log('Room is enabled, attempting to disable...');
          
          // Use the correct disable endpoint
          const disableResponse = await axios.post(`${HMS_API_URL}/rooms/${roomId}`, 
            { enabled: false }, // Send enabled: false in body
            {
              headers: {
                'Authorization': `Bearer ${managementToken}`,
                'Content-Type': 'application/json'
              },
              timeout: 10000
            }
          );
          
          console.log(`✅ Room ${roomId} disabled successfully`);
          return disableResponse.data;
        } else {
          console.log(`Room ${roomId} is already disabled`);
          return { message: 'Room already disabled' };
        }
        
      } catch (statusError) {
        console.error('Failed to get room status:', statusError.response?.data || statusError.message);
        throw statusError;
      }
    }

  } catch (error) {
    console.error('❌ Error in room deletion process:', error.response?.data || error.message);
    throw error;
  }
};

// Get available roles from a template
const getTemplateRoles = async () => {
  try {
    if (!HMS_TEMPLATE_ID) {
      console.log('No template ID provided, using default roles');
      return ['guest', 'host']; // Default fallback roles
    }

    const managementToken = generateManagementToken();

    console.log('Fetching template details...');
    const response = await axios.get(`${HMS_API_URL}/templates/${HMS_TEMPLATE_ID}`, {
      headers: {
        Authorization: `Bearer ${managementToken}`,
      },
      timeout: 10000
    });

    console.log('Template details fetched');
    const roles = response.data.roles || {};
    const roleNames = Object.keys(roles);
    console.log('Available roles:', roleNames);
    return roleNames.length > 0 ? roleNames : ['guest', 'host']; // Fallback if no roles found
  } catch (error) {
    console.error('Error fetching template roles:', error.message);
    console.log('Using default roles as fallback');
    return ['guest', 'host']; // Always return some roles
  }
};

// Socket handlers
export const hmsVideoSocket = (io) => {
  console.log('Setting up HMS video socket handlers');

  // Test HMS connection on startup
  testHMSConnection();

  // Cache for template roles
  let templateRoles = ['guest', 'host']; // Default fallback

  // Fetch roles when initializing
  getTemplateRoles()
    .then(roles => {
      templateRoles = roles;
      console.log('Template roles cached:', templateRoles);
    })
    .catch(err => {
      console.error('Failed to cache template roles:', err);
      templateRoles = ['guest', 'host']; // Keep fallback
    });

  io.on('connection', (socket) => {
    console.log('Socket connected for HMS video:', socket.id);

    socket.on('initiate-group-call', async ({ group, user, audio, sender }) => {
      console.log(`User ${user} initiating group call for ${group.length} participants`);

      try {
        // Use a consistent role for all participants
        const participantRole = templateRoles.includes('guest') ? 'guest' : 
                               templateRoles.includes('host') ? 'host' : 
                               templateRoles[0] || 'guest';

        console.log(`Using role for all participants: ${participantRole}`);

        const room = await createRoom();
        
        // Store room info for cleanup
        activeRooms.set(room.id, {
          roomName: room.name,
          participants: group,
          createdAt: Date.now()
        });

        const token = await createAppToken(room.id, participantRole, user);
        const roomUrl = `https://app.100ms.live/room/${room.id}`;

        // Send response to initiator with room ID included
        socket.emit('group-call-initiated', {
          roomName: room.name,
          token,
          url: roomUrl,
          roomId: room.id  // Include room ID for proper cleanup
        });

        console.log(`✅ Room ${room.id} initiated for user ${user}`);

        // Create tokens for all participants with the same role
        const tokenPromises = group
          .filter(participantId => participantId !== user)
          .map(async (participantId) => {
            try {
              console.log(`Creating token for participant: ${participantId}`);
              const participantToken = await createAppToken(room.id, participantRole, participantId);
              
              // Find the socket for this participant
              const participantSockets = Array.from(io.sockets.sockets.values())
                .filter(s => s.userId === participantId);
              
              participantSockets.forEach(participantSocket => {
                participantSocket.emit('incoming-group-call', {
                  roomName: room.name,
                  token: participantToken,
                  url: roomUrl,
                  roomId: room.id,  // Include room ID
                  audio,
                  sender
                });
              });
              
              console.log(`✅ Token created and sent to participant: ${participantId}`);
            } catch (err) {
              console.error(`❌ Error creating token for participant ${participantId}:`, err);
            }
          });

        // Wait for all tokens to be created
        await Promise.allSettled(tokenPromises);
        
      } catch (error) {
        console.error('❌ Error initiating group call:', error);
        socket.emit('group-call-error', {
          message: 'Failed to initiate group call',
          error: error.message,
          details: 'Check server logs for more information'
        });
      }
    });

    socket.on("DeleteCallRoom", async ({ roomUrl, roomToken, roomId }) => {
      console.log('Room deletion request received:', { roomUrl, roomToken, roomId });
      
      // Determine room ID from multiple sources
      let targetRoomId = roomId; // First try direct room ID
      
      if (!targetRoomId && roomUrl) {
        // Extract from URL pattern: https://app.100ms.live/room/{roomId}
        const urlMatch = roomUrl.match(/\/room\/([^/?]+)/);
        if (urlMatch) {
          targetRoomId = urlMatch[1];
        }
      }
      
      if (!targetRoomId && roomToken) {
        try {
          const decoded = jwt.decode(roomToken);
          targetRoomId = decoded?.room_id;
        } catch (err) {
          console.error('Failed to decode room token:', err);
        }
      }
      
      if (targetRoomId) {
        console.log(`Processing deletion for room ${targetRoomId}`);
        try {
          await deleteRoom(targetRoomId);
          
          // Remove from active rooms
          if (activeRooms.has(targetRoomId)) {
            activeRooms.delete(targetRoomId);
          }
          
          socket.emit('room-deleted', { 
            roomId: targetRoomId,
            success: true 
          });
          console.log(`✅ Room ${targetRoomId} deletion process completed`);
        } catch (error) {
          console.error('❌ Error deleting room:', error);
          socket.emit('room-deletion-failed', {
            roomId: targetRoomId,
            error: error.message,
            details: error.response?.data || 'Check server logs for more information'
          });
        }
      } else {
        console.error('No valid room ID could be determined');
        socket.emit('room-deletion-failed', {
          error: 'No roomId could be extracted from URL, token, or direct parameter',
          received: { roomUrl, hasToken: !!roomToken, roomId }
        });
      }
    });

    // Store user ID when socket connects
    socket.on('register-user', (userId) => {
      socket.userId = userId;
      console.log(`Socket ${socket.id} registered for user ${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected from HMS video:', socket.id);
    });
  });

  // Cleanup old rooms every 10 minutes
  setInterval(async () => {
    const now = Date.now();
    const ROOM_TIMEOUT = 60 * 60 * 1000; // 1 hour
    
    for (const [roomId, roomInfo] of activeRooms.entries()) {
      if (now - roomInfo.createdAt > ROOM_TIMEOUT) {
        console.log(`Cleaning up expired room: ${roomInfo.roomName} (${roomId})`);
        try {
          await deleteRoom(roomId);
          activeRooms.delete(roomId);
          console.log(`✅ Expired room ${roomId} cleaned up`);
        } catch (err) {
          console.error(`❌ Failed to cleanup room ${roomId}:`, err);
          // Still remove from tracking to avoid repeated attempts
          activeRooms.delete(roomId);
        }
      }
    }
  }, 10 * 60 * 1000);

  // Log active rooms periodically for debugging
  setInterval(() => {
    if (activeRooms.size > 0) {
      console.log(`Active rooms: ${activeRooms.size}`);
      activeRooms.forEach((info, roomId) => {
        console.log(`  - ${roomId}: ${info.roomName} (${info.participants.length} participants)`);
      });
    }
  }, 5 * 60 * 1000); // Every 5 minutes
};

export default { hmsVideoSocket };