import { browserHistory } from 'react-router';

export const DISMISS_ERROR = 'DISMISS_ERROR';

const dismissSuccess = () => {
  return {
    type: DISMISS_ERROR
  };
};

export const dismissError = () => async (dispatch) => {
  dispatch(dismissSuccess());
  browserHistory.goBack();
};
