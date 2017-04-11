const localStorageError = Object.assign(new Error('local storage failure'), { code: 'LocalStorageBlocked' });

export const loadState = () => {
  try {
    return JSON.parse(localStorage.getItem('state'));
  } catch (e) {
    return {
      error: {
        fullPage: localStorageError
      }
    };
  }
};

export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);
  } catch (e) {
    return {
      error: {
        fullPage: localStorageError
      }
    };
  }
};
