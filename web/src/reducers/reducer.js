import { DISMISS_ERROR } from '../actions/dismissError';
import { INITIALISE } from '../actions/inititialise';
import { REGISTER_REQUEST, REGISTER_SUCESSS, REGISTER_FAILURE } from '../actions/register';
import { REGISTER2_REQUEST, REGISTER2_SUCESSS, REGISTER2_FAILURE } from '../actions/register2';
import { SESSION_REQUEST, SESSION_SUCCESS, SESSION_RESET, SESSION_FAILURE } from '../actions/session';
import { TOPUP_REQUEST, TOPUP_SUCCESS, TOPUP_FAILURE } from '../actions/topup';
import { PURCHASE_REQUEST, PURCHASE_SUCCESS, PURCHASE_FAILURE } from '../actions/purchase';
import { DESTROY_SESSION } from '../actions/destroy-session';
import { LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_FAILURE } from '../actions/logout';
import { SUPPORT_REQUEST, SUPPORT_SUCCESS, SUPPORT_FAILURE } from '../actions/support';
import { SIGNIN_REQUEST, SIGNIN_SUCCESS, SIGNIN_FAILURE } from '../actions/signin';
import { SIGNIN2_REQUEST, SIGNIN2_SUCCESS, SIGNIN2_FAILURE } from '../actions/signin2';
import { STORE_REQUEST, STORE_SUCCESS, STORE_FAILURE } from '../actions/store';
import { SURVEY_REQUEST, SURVEY_SUCCESS, SURVEY_FAILURE } from '../actions/survey';
import { MARKETPLACE_REQUEST, MARKETPLACE_SUCCESS, MARKETPLACE_FAILURE } from '../actions/marketplace';
import { OUT_OF_STOCK_REQUEST, OUT_OF_STOCK_SUCCESS, OUT_OF_STOCK_FAILURE } from '../actions/out-of-stock';
import { UNLIKE_ITEM, LIKE_ITEM } from '../actions/like-item';
import { LOCAL_STORAGE_SAVE_ERROR } from '../actions/save-error';
import { BOX_RECEIVED_REQUEST, BOX_RECEIVED_SUCCESS, BOX_RECEIVED_FAILURE } from '../actions/box-received';
import { getInitialState } from '../state';

const stateOnRequestInitialization = (requestId, updatedProps, state) =>
  ({
    ...state,
    pending: [...state.pending, requestId]
  });

const stateWithFullPageError = (requestId, error, state) =>
  ({
    ...state,
    error: {
      ...state.error,
      fullPage: error
    },
    pending: state.pending.filter(e => e !== requestId)
  });

const stateOnRequestCompletion = (requestId, updatedProps, state) =>
  ({
    ...state,
    ...updatedProps,
    pending: state.pending.filter(e => e !== requestId)
  });

export default (state, action) => {
  switch (action.type) {
    case INITIALISE: {
      return {
        ...state,
        initialised: true
      };
    }
    case DISMISS_ERROR: {
      return {
        ...state,
        error: {
          ...state.error,
          fullPage: undefined
        }
      };
    }
    case REGISTER_REQUEST:
      return stateOnRequestInitialization('register', {}, state);
    case REGISTER_SUCESSS:
      return stateOnRequestCompletion('register', action.response, state);
    case REGISTER_FAILURE:
      return stateWithFullPageError('register', action.error, state);
    case SIGNIN_REQUEST:
      return stateOnRequestInitialization('signin', {}, state);
    case SIGNIN_SUCCESS:
      return stateOnRequestCompletion('signin', getInitialState(), state);
    case SIGNIN_FAILURE:
      return stateWithFullPageError('signin', action.error, state);
    case SIGNIN2_REQUEST:
      return stateOnRequestInitialization('signin2', {}, state);
    case SIGNIN2_SUCCESS:
      return stateOnRequestCompletion('signin2', action.response, state);
    case SIGNIN2_FAILURE:
      return stateWithFullPageError('signin2', action.error, state);
    case DESTROY_SESSION:
      return {
        ...getInitialState(),
        error: state.error
      };
    case REGISTER2_REQUEST: {
      const updatedStateProps = {
        register: {},
      };
      return stateOnRequestInitialization('register2', updatedStateProps, state);
    }
    case REGISTER2_SUCESSS: {
      const { user } = action.response;
      const updatedStateProps = {
        error: {
          ...state.error,
          inline: undefined
        },
        user
      };
      return stateOnRequestCompletion('register2', updatedStateProps, state);
    }
    case REGISTER2_FAILURE: {
      const { cardError, error } = action;
      const updatedStateProps = {
        error: {
          inline: cardError,
          fullPage: error
        }
      };
      return stateOnRequestCompletion('register2', updatedStateProps, state);
    }
    case SESSION_REQUEST:
      return stateOnRequestInitialization('session', {}, state);
    case SESSION_SUCCESS:
      return stateOnRequestCompletion('session', action.response, state);
    case SESSION_RESET:
      return {
        ...getInitialState(),
        error: state.error
      };
    case SESSION_FAILURE:
      return stateWithFullPageError('session', action.error, state);
    case OUT_OF_STOCK_REQUEST:
      return stateOnRequestInitialization('outofstock', {}, state);
    case OUT_OF_STOCK_SUCCESS: {
      const { itemId } = action;
      const tagItemAsDepleted = item => item.id === itemId ? { ...item, count: 0 } : item;
      const updatedStateProps = {
        store: {
          ...state.store,
          items: state.store.items.map(tagItemAsDepleted),
        }
      };
      return stateOnRequestCompletion('outofstock', updatedStateProps, state);
    }
    case OUT_OF_STOCK_FAILURE:
      return stateWithFullPageError('outofstock', action.error, state);
    case SUPPORT_REQUEST:
      return stateOnRequestInitialization('support', {}, state);
    case SUPPORT_SUCCESS:
      return stateOnRequestCompletion('support', {}, state);
    case SUPPORT_FAILURE:
      return stateWithFullPageError('support', action.error, state);
    case LOGOUT_REQUEST:
      return stateOnRequestInitialization('logout', {}, state);
    case LOGOUT_SUCCESS:
      return stateOnRequestCompletion('logout', getInitialState(), state);
    case LOGOUT_FAILURE:
      return stateWithFullPageError('logout', action.error, state);
    case TOPUP_REQUEST:
      return stateOnRequestInitialization('topup', {}, state);
    case TOPUP_SUCCESS: {
      const { balance, transaction, cardDetails } = action.response;
      const { user } = state;
      const updatedStateProps = {
        user: {
          ...state.user,
          balance,
          cardDetails,
          transactions: [transaction, ...user.transactions]
        }
      };
      return stateOnRequestCompletion('topup', updatedStateProps, state);
    }
    case TOPUP_FAILURE: {
      const { error, cardError } = action;
      const updatedStateProps = {
        error: {
          inline: cardError,
          fullPage: error
        }
      };
      return stateOnRequestCompletion('topup', updatedStateProps, state);
    }
    case PURCHASE_REQUEST:
      return stateOnRequestInitialization('purchase', {}, state);
    case PURCHASE_SUCCESS: {
      const { balance, transaction } = action.response;
      const { user } = state;
      const updatedStateProps = {
        user: {
          ...user,
          balance,
          transactions: [transaction, ...user.transactions]
        }
      };
      return stateOnRequestCompletion('purchase', updatedStateProps, state);
    }
    case PURCHASE_FAILURE:
      return stateWithFullPageError('purchase', action.error, state);
    case STORE_REQUEST:
      return stateOnRequestInitialization('store', {}, state);
    case STORE_SUCCESS:
      return stateOnRequestCompletion('store', action.response, state);
    case STORE_FAILURE:
      return stateWithFullPageError('store', action.error, state);
    case SURVEY_REQUEST:
      return stateOnRequestInitialization('survey', {}, state);
    case SURVEY_SUCCESS:
      return stateOnRequestCompletion('survey', action.response, state);
    case SURVEY_FAILURE:
      return stateWithFullPageError('survey', action.error, state);
    case MARKETPLACE_REQUEST:
      return stateOnRequestInitialization('marketplace', {}, state);
    case MARKETPLACE_SUCCESS:
      return stateOnRequestCompletion('marketplace', {}, state);
    case MARKETPLACE_FAILURE:
      return stateWithFullPageError('marketplace', action.error, state);
    case LIKE_ITEM: {
      const { itemId } = action;
      const { likedItemIds } = state;
      const updatedItemIds = [...new Set(likedItemIds.concat(itemId))];

      return {
        ...state,
        likedItemIds: updatedItemIds
      };
    }
    case UNLIKE_ITEM: {
      const { itemId } = action;
      const { likedItemIds } = state;
      const updatedLikedItemIds = [...new Set(likedItemIds)]
        .filter((el) => el !== itemId);

      return {
        ...state,
        likedItemIds: updatedLikedItemIds
      };
    }
    case LOCAL_STORAGE_SAVE_ERROR:
      return {
        ...state,
        error: {
          fullPage: action.error
        }
      };
    case BOX_RECEIVED_REQUEST: {
      const { boxId } = action;
      const updatedStateProps = {
        pending: [...state.pending, 'box-received'],
        lastBoxIdMarkedAsReceived: boxId
      };
      return stateOnRequestInitialization('box-received', updatedStateProps, state);
    }
    case BOX_RECEIVED_SUCCESS: {
      const { store } = action.response;
      return stateOnRequestCompletion('box-received', { store }, state);
    }
    case BOX_RECEIVED_FAILURE:
      return {
        ...stateWithFullPageError('box-received', action.error, state),
        lastBoxIdMarkedAsReceived: null
      };
    default:
      return state;
  }
};
