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
      return action.jsonBody.response;
    case RECEIVE_REGISTRATION_PHASE2:
      const response = action.jsonBody.response;
      return {
        ...state,
        user: response.user,
        store: response.store
      };
    default:
      return state;
  }
};
