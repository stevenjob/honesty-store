import getErrorDefinition from '../error/errors';
import history from '../history';

export const DISMISS_ERROR = 'DISMISS_ERROR';

const dismiss = () => {
  return {
    type: DISMISS_ERROR
  };
};

export const dismissError = (code) => async (dispatch) => {

  if (code != null) {
    const { redirectionURL } = getErrorDefinition(code);
    if (redirectionURL != null) {
      history.push(redirectionURL);
    }
  }

  dispatch(dismiss());
};
