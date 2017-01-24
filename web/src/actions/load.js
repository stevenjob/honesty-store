import { performRegister } from './register';
import { performSession } from './session';
import { performSignin2 } from './signin2';

export const performLoad = ({ storeId, emailToken }) => async (dispatch, getState) => {
    const { refreshToken } = getState();
    if (emailToken != null) {
        return dispatch(performSignin2({ storeId, emailToken }));
    } else if (refreshToken != null) {
        return dispatch(performSession({ storeId }));
    } else {
        return dispatch(performRegister({ storeId }));
    }
};