import axios from 'axios'
import { Auido_Only, Clear_Offer, Make__Call, Make__Incoming, Sotre_Candidate, Sotre_Peer } from '../actionTypes';

const API_URL = process.env.REACT_APP_SERVER_URL;

export const storePeer = (peerConnection)=>{
  return {type: Sotre_Peer, payload: peerConnection}
}

export const makeCall = ()=>{
  console.log("callled")
  return{type: Make__Call}
}
export const makeIncoming = ()=>{
  return {type: Make__Incoming}
}

export const storeCandidate = (candidate)=>{
  return {type: Sotre_Candidate, payload: candidate}
}

export const clearOffer = ()=>{
  return{type: Clear_Offer}
}

export const onlyAudio = ()=>{
  return{type: Auido_Only}
}