import { performRegister } from './register';
import { performSession } from './session';

export const LOAD = 'LOAD';

const load = ({ storeId }) => ({
    type: LOAD,
    storeId
});

export const performLoad = ({ storeId }) => async (dispatch, getState) => {
    const { refreshToken } = getState();
    // TODO: look for magic link code
    if (refreshToken == null) {
        return dispatch(performRegister({ storeId }));
    } else {
        dispatch(performSession({ storeId }));
    }
};