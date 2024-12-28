import {io} from 'socket.io-client'

const API_URL = process.env.REACT_APP_SERVER_URL;

const socket = io(API_URL, { autoConnect: true });

socket.on("connect", () => {
  console.log("Server connected: ",socket.id); // x8WIv7-mJelg7on_ALbx
});

socket.on("disconnect", () => {
  console.log("Server disconnected: ",socket.id); // undefined
});

export default socket;