import socket from "./Socket";

export const joinGroup = (data) => {
 socket.emit('joinGroup', (data));
};

export const leaveGroup = (data) => {
  socket.emit('leaveGroup', (data));
 };

export const joinUser = (user) => {
  socket.emit('joinUser', (user));
 };
