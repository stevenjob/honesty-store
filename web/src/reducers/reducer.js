import {
    RECEIVE_REGISTRATION_PHASE1, RECEIVE_REGISTRATION_PHASE2,
    REQUEST_REGISTRATION_PHASE1, REQUEST_REGISTRATION_PHASE2 } from '../actions/register';

const getInitialState = () => {
  return {
    pending: [],
    user: {},
    store: {},
    accessToken: null,
    refreshToken: null
  };
};

export default (state = getInitialState(), action) => {
  switch (action.type) {
    case REQUEST_REGISTRATION_PHASE1:
      return {
        ...state,
        pending: [...state.pending, 'register']
      };
    case REQUEST_REGISTRATION_PHASE2:
      return {
        ...state,
        pending: [...state.pending, 'register2']
      };
    case  RECEIVE_REGISTRATION_PHASE1:
      return {
        ...state,
        ...action.response,
        pending: state.pending.filter(e => e !== 'register')
      };
    case RECEIVE_REGISTRATION_PHASE2:
      const { user, store } = action.response;
      return {
        ...state,
        user: user,
        store: store,
        pending: state.pending.filter(e => e !== 'register2')
      };
    default:
      return state;
  }
};
