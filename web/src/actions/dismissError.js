import { errorDefinitions } from '../error/errors';
import history from '../history';

export const DISMISS_ERROR = 'DISMISS_ERROR';

const dismiss = () => {
  return {
    type: DISMISS_ERROR
  };
};

const redirectUserIfNecessary = (errorCode) => {
  const errorDef = errorDefinitions[errorCode];
  switch (errorDef) {
    case errorDefinitions.StoreNotFound:
      history.replace('/');
      break;
    default:
      break;
  }
};

export const dismissError = ({ code }) => async (dispatch) => {
  redirectUserIfNecessary(code);

  dispatch(dismiss());
};
