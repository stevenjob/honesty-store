import { performRegister } from './register';
import { performSession } from './session';
import { performSignin2 } from './signin2';
import history from '../history';

export const INITIALISE = 'INITIALISE';

const initialise = () => {
  return {
    type: INITIALISE
  };
};

export const performInitialise = ({ storeCode, emailToken }) => async (dispatch, getState) => {
  const { refreshToken, initialised } = getState();
  if (initialised) {
    return;
  }
  if (refreshToken != null) {
    dispatch(initialise());
    const { pathname } = history.getCurrentLocation();
    if (pathname === '/') {
      history.replace('/store');
    }
    return dispatch(performSession());
  }
  if (emailToken != null) {
    dispatch(initialise());
    return dispatch(performSignin2({ emailToken }));
  }
  if (storeCode != null) {
    dispatch(initialise());
    return dispatch(performRegister({ storeCode }));
  }
};
