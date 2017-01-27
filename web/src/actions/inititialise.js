import { performRegister } from './register';
import { performSession } from './session';
import { performSignin2 } from './signin2';
import { browserHistory } from 'react-router';

export const INTIALISE = 'INTIALISE';

const initialise = () => {
  return {
    type: INTIALISE
  };
};

export const performInitialise = ({ storeCode, emailToken }) => async (dispatch, getState) => {
    const { refreshToken, initialised } = getState();
    if (initialised) {
        return;
    }
    if (refreshToken != null) {
        dispatch(initialise());
        const { pathname } = browserHistory.getCurrentLocation();
        if (pathname === '/') {
            browserHistory.replace('/store');
        }
        return dispatch(performSession({ storeCode }));
    }
    if (emailToken != null) {
        dispatch(initialise());
        return dispatch(performSignin2({ storeCode, emailToken }));
    }
    if (storeCode != null) {
        dispatch(initialise());
        return dispatch(performRegister({ storeCode }));
    }
};