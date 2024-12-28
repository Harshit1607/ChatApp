import socket from "./Socket";

export const joinGroup = (data) => {
 socket.emit('joinGroup', (data));
};




// export const groupCreated = (callback) =>{
//   socket.on('groupCreated', (friend)=>{
//     callback(friend);
//   })
// }