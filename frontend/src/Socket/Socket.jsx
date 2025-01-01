import {io} from 'socket.io-client'

const API_URL = process.env.REACT_APP_SERVER_URL;

const socket = io(API_URL, { autoConnect: true });

socket.on("connect", () => {
  console.log("Server connected: ",socket.id); 
});

socket.on("disconnect", () => {
  console.log("Server disconnected: ",socket.id); 
});

export default socket;