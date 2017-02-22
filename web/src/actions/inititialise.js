import { performRegister } from './register';
import { performSession } from './session';
import { performSignin2 } from './signin2';
import history from '../history';
import isRegisteredUser from '../reducers/is-registered-user';

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

  dispatch(initialise());

  if (refreshToken != null) {
    const { pathname } = history.getCurrentLocation();
    if (pathname === '/' || storeCode != null) {
      history.replace('/store');
    }

    await performSession()(dispatch, getState);

    const { user, store: { code } } = getState();

    if (storeCode != null &&
        storeCode !== code &&
        isRegisteredUser(user)) {
      history.replace(`/store/change/${storeCode}`);
    }
    return;
  }
  if (emailToken != null) {
    return dispatch(performSignin2({ emailToken }));
  }
  if (storeCode != null) {
    return dispatch(performRegister({ storeCode }));
  }
};
