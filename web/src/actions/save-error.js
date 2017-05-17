export const LOCAL_STORAGE_SAVE_ERROR = 'LOCAL_STORAGE_SAVE_ERROR';

export const error = Object.assign(new Error('local storage failure'), {
  code: 'LocalStorageBlocked'
});

export const localStorageSaveError = () => {
  return {
    type: LOCAL_STORAGE_SAVE_ERROR,
    error
  };
};
