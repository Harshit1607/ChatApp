import axios from 'axios'
import { End_Group_Call, Make_Group_Call, Make_Group_Incoming, Save_Room } from '../actionTypes';

const API_URL = process.env.REACT_APP_SERVER_URL;

export const makeGroupCall = ()=>{
  return{type: Make_Group_Call}
}

export const makeGroupIncoming = ()=>{
  return{type: Make_Group_Incoming}
}

export const saveRoom = (room)=>{
  return{type: Save_Room, payload: room}
}

export const endCall = ()=>{
  return{type:End_Group_Call }
}