import { DISMISS_ERROR } from '../actions/dismissError';
import { INITIALISE } from '../actions/inititialise';
import {
  REGISTER_REQUEST,
  REGISTER_SUCESSS,
  REGISTER_FAILURE
} from '../actions/register';
import {
  REGISTER2_REQUEST,
  REGISTER2_SUCESSS,
  REGISTER2_FAILURE
} from '../actions/register2';
import {
  SESSION_REQUEST,
  SESSION_SUCCESS,
  SESSION_RESET,
  SESSION_FAILURE
} from '../actions/session';
import { TOPUP_REQUEST, TOPUP_SUCCESS, TOPUP_FAILURE } from '../actions/topup';
import {
  PURCHASE_REQUEST,
  PURCHASE_SUCCESS,
  PURCHASE_FAILURE
} from '../actions/purchase';
import { DESTROY_SESSION } from '../actions/destroy-session';
import {
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE
} from '../actions/logout';
import {
  SUPPORT_REQUEST,
  SUPPORT_SUCCESS,
  SUPPORT_FAILURE
} from '../actions/support';
import {
  SIGNIN_REQUEST,
  SIGNIN_SUCCESS,
  SIGNIN_FAILURE
} from '../actions/signin';
import {
  SIGNIN2_REQUEST,
  SIGNIN2_SUCCESS,
  SIGNIN2_FAILURE
} from '../actions/signin2';
import { STORE_REQUEST, STORE_SUCCESS, STORE_FAILURE } from '../actions/store';
import {
  SURVEY_REQUEST,
  SURVEY_SUCCESS,
  SURVEY_FAILURE
} from '../actions/survey';
import {
  MARKETPLACE_REQUEST,
  MARKETPLACE_SUCCESS,
  MARKETPLACE_FAILURE
} from '../actions/marketplace';
import {
  OUT_OF_STOCK_REQUEST,
  OUT_OF_STOCK_SUCCESS,
  OUT_OF_STOCK_FAILURE
} from '../actions/out-of-stock';
import { UNLIKE_ITEM, LIKE_ITEM } from '../actions/like-item';
import { LOCAL_STORAGE_SAVE_ERROR } from '../actions/save-error';
import {
  BOX_RECEIVED_REQUEST,
  BOX_RECEIVED_SUCCESS,
  BOX_RECEIVED_FAILURE
} from '../actions/box-received';
import {
  REFUND_REQUEST,
  REFUND_SUCCESS,
  REFUND_FAILURE
} from '../actions/refund';
import { LOGGED_OUT_IN_ANOTHER_SESSION } from '../actions/logged-out';
import {
  ALL_ITEMS_REQUEST,
  ALL_ITEMS_SUCCESS,
  ALL_ITEMS_FAILURE
} from '../actions/all-items';
import {
  UPDATE_ITEM_REQUEST,
  UPDATE_ITEM_SUCCESS,
  UPDATE_ITEM_FAILURE
} from '../actions/update-item';
import { getInitialState } from '../state';

const requestState = (requestId, updatedProps, state) => ({
  ...state,
  ...updatedProps,
  pending: [...state.pending, requestId]
});

const fullPageErrorState = (requestId, error, state) => ({
  ...state,
  error: {
    ...state.error,
    fullPage: state.error.fullPage || error
  },
  pending: state.pending.filter(e => e !== requestId)
});

const completionState = (requestId, updatedProps, state) => ({
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
      return requestState('register', {}, state);
    case REGISTER_SUCESSS:
      return completionState('register', action.response, state);
    case REGISTER_FAILURE:
      return fullPageErrorState('register', action.error, state);
    case SIGNIN_REQUEST:
      return requestState('signin', {}, state);
    case SIGNIN_SUCCESS:
      return completionState('signin', getInitialState(), state);
    case SIGNIN_FAILURE:
      return fullPageErrorState('signin', action.error, state);
    case SIGNIN2_REQUEST:
      return requestState('signin2', {}, state);
    case SIGNIN2_SUCCESS:
      return completionState('signin2', action.response, state);
    case SIGNIN2_FAILURE:
      return fullPageErrorState('signin2', action.error, state);
    case DESTROY_SESSION:
      return {
        ...getInitialState(),
        error: state.error
      };
    case REGISTER2_REQUEST: {
      const updatedStateProps = {
        register: {}
      };
      return requestState('register2', updatedStateProps, state);
    }
    case REGISTER2_SUCESSS: {
      const updatedStateProps = {
        ...action.response,
        error: {
          ...state.error,
          inline: undefined
        }
      };
      return completionState('register2', updatedStateProps, state);
    }
    case REGISTER2_FAILURE: {
      const { cardError, error } = action;
      const updatedStateProps = {
        error: {
          inline: cardError,
          fullPage: state.error.fullPage || error
        }
      };
      return completionState('register2', updatedStateProps, state);
    }
    case SESSION_REQUEST:
      return requestState('session', {}, state);
    case SESSION_SUCCESS:
      return completionState('session', action.response, state);
    case SESSION_RESET:
      return {
        ...getInitialState(),
        error: state.error
      };
    case SESSION_FAILURE:
      return fullPageErrorState('session', action.error, state);
    case OUT_OF_STOCK_REQUEST:
      return requestState('outofstock', {}, state);
    case OUT_OF_STOCK_SUCCESS: {
      const { itemId } = action;
      const tagItemAsDepleted = item =>
        item.id === itemId ? { ...item, count: 0 } : item;
      const updatedStateProps = {
        store: {
          ...state.store,
          items: state.store.items.map(tagItemAsDepleted)
        }
      };
      return completionState('outofstock', updatedStateProps, state);
    }
    case OUT_OF_STOCK_FAILURE:
      return fullPageErrorState('outofstock', action.error, state);
    case SUPPORT_REQUEST:
      return requestState('support', {}, state);
    case SUPPORT_SUCCESS:
      return completionState('support', {}, state);
    case SUPPORT_FAILURE:
      return fullPageErrorState('support', action.error, state);
    case LOGOUT_REQUEST:
      return requestState('logout', {}, state);
    case LOGOUT_SUCCESS:
      return completionState('logout', getInitialState(), state);
    case LOGOUT_FAILURE:
      return fullPageErrorState('logout', action.error, state);
    case TOPUP_REQUEST:
      return requestState('topup', {}, state);
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
      return completionState('topup', updatedStateProps, state);
    }
    case TOPUP_FAILURE: {
      const { error, cardError } = action;
      const updatedStateProps = {
        error: {
          inline: cardError,
          fullPage: state.error.fullPage || error
        }
      };
      return completionState('topup', updatedStateProps, state);
    }
    case PURCHASE_REQUEST:
      return requestState('purchase', {}, state);
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
      return completionState('purchase', updatedStateProps, state);
    }
    case PURCHASE_FAILURE:
      return fullPageErrorState('purchase', action.error, state);
    case STORE_REQUEST:
      return requestState('store', {}, state);
    case STORE_SUCCESS:
      return completionState('store', action.response, state);
    case STORE_FAILURE:
      return fullPageErrorState('store', action.error, state);
    case SURVEY_REQUEST:
      return requestState('survey', {}, state);
    case SURVEY_SUCCESS:
      return completionState('survey', action.response, state);
    case SURVEY_FAILURE:
      return fullPageErrorState('survey', action.error, state);
    case MARKETPLACE_REQUEST:
      return requestState('marketplace', {}, state);
    case MARKETPLACE_SUCCESS:
      return completionState('marketplace', {}, state);
    case MARKETPLACE_FAILURE:
      return fullPageErrorState('marketplace', action.error, state);
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
      const updatedLikedItemIds = [...new Set(likedItemIds)].filter(
        el => el !== itemId
      );

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
      return requestState('box-received', updatedStateProps, state);
    }
    case BOX_RECEIVED_SUCCESS: {
      const { store } = action.response;
      return completionState('box-received', { store }, state);
    }
    case BOX_RECEIVED_FAILURE:
      return {
        ...fullPageErrorState('box-received', action.error, state),
        lastBoxIdMarkedAsReceived: null
      };
    case REFUND_REQUEST:
      return requestState('refund', {}, state);
    case REFUND_SUCCESS: {
      const { balance, transaction } = action.response;
      const { user } = state;
      const updatedStateProps = {
        user: {
          ...user,
          balance,
          transactions: [transaction, ...user.transactions]
        }
      };
      return completionState('refund', updatedStateProps, state);
    }
    case REFUND_FAILURE:
      return fullPageErrorState('refund', action.error, state);
    case LOGGED_OUT_IN_ANOTHER_SESSION: {
      const updatedState = {
        ...getInitialState(),
        error: {
          ...state.error,
          fullPage: state.error.fullPage
        }
      };
      return fullPageErrorState(null, action.error, updatedState);
    }
    case ALL_ITEMS_REQUEST:
      return requestState('all-items', {}, state);
    case ALL_ITEMS_SUCCESS: {
      const { response } = action;
      const updatedStateProps = {
        admin: {
          items: response
        }
      };
      return completionState('all-items', updatedStateProps, state);
    }
    case ALL_ITEMS_FAILURE:
      return fullPageErrorState('all-items', action.error, state);
    case UPDATE_ITEM_REQUEST:
      return requestState('update-item', {}, state);
    case UPDATE_ITEM_SUCCESS: {
      const updatedItem = action.response;
      const { items } = state.admin || [];
      const updatedState = {
        admin: {
          ...state.admin,
          items: [
            ...items.filter(({ id }) => id !== updatedItem.id),
            updatedItem
          ]
        }
      };
      return completionState('update-item', updatedState, state);
    }
    case UPDATE_ITEM_FAILURE:
      return fullPageErrorState('update-item', action.error, state);
    default:
      return state;
  }
};
