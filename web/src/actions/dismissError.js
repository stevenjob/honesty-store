export const DISMISS_ERROR = 'DISMISS_ERROR';

const dismiss = () => {
  return {
    type: DISMISS_ERROR
  };
};

export const dismissError = () => async (dispatch) => {
  dispatch(dismiss());
};
