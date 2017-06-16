export const LOGGED_OUT_IN_ANOTHER_SESSION = 'LOGGED_OUT_IN_ANOTHER_SESSION';

export const loggedOutInAnotherSession = error => {
  return {
    type: LOGGED_OUT_IN_ANOTHER_SESSION,
    error
  };
};
