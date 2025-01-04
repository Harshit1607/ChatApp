import { Call_Rejected, Clear_Offer, ICE_Candidate_Received, Make__Call, Make__Incoming, Recieved_Answer, Recieved_Offer, Sotre_Candidate, Sotre_Peer } from "../actionTypes"

const initialState = {
  call: false,
  incoming: true,
  peerConnection: null, 
  offer: null,
  sender: null,
  answer: null, 
  candidate: null,
}

function callReducer(state=initialState, action){
  switch(action.type){
    case Make__Call:
      return{
        ...state,
        call: true
      }
    case Make__Incoming:
      return{
        ...state,
        incoming: true,
      }
    case Sotre_Peer:
      return{
        ...state,
        peerConnection: action.payload,
      }
    case Recieved_Offer:
      return{
        ...state,
        offer: action.payload.offer,
        sender: action.payload.sender
      }
    case Recieved_Answer:
      return{
        ...state,
        answer: action.payload.answer
      }
    case ICE_Candidate_Received:
      return{
        ...state,
        candidate: action.payload.candidate
      }
    case Sotre_Candidate:
      return{
        ...state,
        candidate: action.payload
      }
    case Clear_Offer:
      return {
        ...state,
        call: false,
        incoming: false,
        peerConnection: null, 
        offer: null,
        sender: null,
        answer: null, 
        candidate: null,
      }
    case Call_Rejected: 
      return{
        ...state,
        call: false,
        incoming: false,
        peerConnection: null, 
        offer: null,
        sender: null,
        answer: null, 
        candidate: null,
      }
    default:
      return state
  }
}

export default callReducer