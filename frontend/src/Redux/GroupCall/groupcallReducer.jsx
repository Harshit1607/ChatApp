import { End_Group_Call, Make_Group_Call, Make_Group_Incoming, Save_Room } from "../actionTypes"

const initialState = {
  groupCall: false,
  groupCallIncoming: false,
  room: null,
}
function groupcallReducer(state=initialState, action){
  switch(action.type){
    case Make_Group_Call:
      return{
        ...state,
        groupCall: true,
      }
    case Make_Group_Incoming:
      return{
        ...state,
        groupCallIncoming: true,
      }
    case Save_Room:
      return{
        ...state,
        room: action.payload
      }
    case End_Group_Call:
      return{
        ...state,
        groupCall: false,
        groupCallIncoming: false,
      }
    default:
      return state

  }
}

export default groupcallReducer