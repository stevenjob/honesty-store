import { errorDefinitions } from '../error/errors';
import history from '../history';

export const DISMISS_ERROR = 'DISMISS_ERROR';

const dismiss = () => {
  return {
    type: DISMISS_ERROR
  };
};

export const dismissError = (code) => async (dispatch) => {

  if (code != null) {
    const { redirectionURL } = errorDefinitions[code];
    if (redirectionURL != null) {
      history.replace(redirectionURL);
    }
  }

  dispatch(dismiss());
};
