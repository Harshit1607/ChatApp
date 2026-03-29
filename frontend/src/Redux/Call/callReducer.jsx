import { Audio_Only, Call_Rejected, Clear_Offer, ICE_Candidate_Received, Make__Call, Make__Incoming, Received_Answer, Received_Offer, Set_Call_Receiver, Store_Candidate, Store_Peer } from "../actionTypes"

const initialState = {
  call: false,
  incoming: false,
  peerConnection: null, 
  offer: null,
  sender: null,
  answer: null, 
  candidate: null,
  audio: false,
  receiver: null,
}

function callReducer(state=initialState, action){
  switch(action.type){
    case Audio_Only:
      return{
        ...state,
        audio: true
      }
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
    case Store_Peer:
      return{
        ...state,
        peerConnection: action.payload,
      }
    case Received_Offer:
      return{
        ...state,
        offer: action.payload.offer,
        sender: action.payload.sender
      }
    case Received_Answer:
      return{
        ...state,
        answer: action.payload.answer
      }
    case ICE_Candidate_Received:
      return{
        ...state,
        candidate: action.payload.candidate
      }
    case Store_Candidate:
      return{
        ...state,
        candidate: action.payload
      }
    case Set_Call_Receiver: 
      return{
        ...state,
        receiver: action.payload,
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
        audio: false,
        receiver: null,
      }
    case Call_Rejected: 
      return{
        ...state,
        audio: false,
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