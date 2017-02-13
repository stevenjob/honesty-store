import { browserHistory } from 'react-router';

export const DISMISS_SUCCESS = 'DISMISS_SUCCESS';

const dismissSuccess = () => {
  return {
    type: DISMISS_SUCCESS
  };
};

export const dismissError = () => async (dispatch) => {
  dispatch(dismissSuccess());
  browserHistory.goBack();
};
