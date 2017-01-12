import { RECEIVE_REGISTRATION_PHASE1, RECEIVE_REGISTRATION_PHASE2 } from '../actions/register';

const getInitialState = () => {
  return {
    user: {},
    store: {},
    accessToken: null,
    refreshToken: null
  };
};

export default (state = getInitialState(), action) => {
  switch (action.type) {
    case  RECEIVE_REGISTRATION_PHASE1:
      return action.response;
    case RECEIVE_REGISTRATION_PHASE2:
      const { user, store } = action.response;
      return {
        ...state,
        user: user,
        store: store
      };
    default:
      return state;
  }
};
