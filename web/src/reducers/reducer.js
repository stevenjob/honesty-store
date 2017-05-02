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

const addPendingRequest = (name, state) =>
({
  ...state,
  pending: [...state.pending, name]
});

const showFullPageError = (name, error, state) =>
({
  ...state,
  error: {
    ...state.error,
    fullPage: error
  },
  pending: state.pending.filter(e => e !== name)
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
      return addPendingRequest('register', state);
    case REGISTER_SUCESSS: {
      return {
        ...state,
        ...action.response,
        pending: state.pending.filter(e => e !== 'register')
      };
    }
    case REGISTER_FAILURE:
      return showFullPageError('register', action.error, state);
    case SIGNIN_REQUEST:
      return addPendingRequest('signin', state);
    case SIGNIN_SUCCESS: {
      return {
        ...getInitialState()
      };
    }
    case SIGNIN_FAILURE:
      return showFullPageError('signin', action.error, state);
    case SIGNIN2_REQUEST:
      return addPendingRequest('signin2', state);
    case SIGNIN2_SUCCESS: {
      return {
        ...state,
        ...action.response,
        pending: state.pending.filter(e => e !== 'signin2')
      };
    }
    case SIGNIN2_FAILURE:
      return showFullPageError('signin2', action.error, state);
    case DESTROY_SESSION: {
      return {
        ...getInitialState(),
        error: state.error
      };
    }
    case REGISTER2_REQUEST: {
      return {
        ...state,
        register: {},
        pending: [...state.pending, 'register2']
      };
    }
    case REGISTER2_SUCESSS: {
      const { user } = action.response;
      return {
        ...state,
        error: {
          ...state.error,
          inline: undefined
        },
        user: user,
        pending: state.pending.filter(e => e !== 'register2')
      };
    }
    case REGISTER2_FAILURE: {
      const { cardError, error } = action;
      return {
        ...state,
        error: {
          inline: cardError,
          fullPage: error
        },
        pending: state.pending.filter(e => e !== 'register2')
      };
    }
    case SESSION_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'session']
      };
    }
    case SESSION_SUCCESS: {
      return {
        ...state,
        ...action.response,
        pending: state.pending.filter(e => e !== 'session')
      };
    }
    case SESSION_RESET: {
      return {
        ...getInitialState(),
        error: state.error
      };
    }
    case SESSION_FAILURE:
      return showFullPageError('session', action.error, state);
    case OUT_OF_STOCK_REQUEST:
      return addPendingRequest('outofstock', state);
    case OUT_OF_STOCK_SUCCESS: {
      const { itemId } = action;
      const tagItemAsDepleted = item => item.id === itemId ? { ...item, count: 0 } : item;
      return {
        ...state,
        store: {
          ...state.store,
          items: state.store.items.map(tagItemAsDepleted),
        },
        pending: state.pending.filter(e => e !== 'outofstock')
      };
    }
    case OUT_OF_STOCK_FAILURE:
      return showFullPageError('outofstock', action.error, state);
    case SUPPORT_REQUEST:
      return addPendingRequest('support', state);
    case SUPPORT_SUCCESS: {
      return {
        ...state,
        pending: state.pending.filter(e => e !== 'support')
      };
    }
    case SUPPORT_FAILURE:
      return showFullPageError('support', action.error, state);
    case LOGOUT_REQUEST:
      return addPendingRequest('logout', state);
    case LOGOUT_SUCCESS: {
      return {
        ...getInitialState(),
        error: state.error
      };
    }
    case LOGOUT_FAILURE:
      return showFullPageError('logout', action.error, state);
    case TOPUP_REQUEST:
      return addPendingRequest('topup', state);
    case TOPUP_SUCCESS: {
      const { balance, transaction, cardDetails } = action.response;
      const { user } = state;
      return {
        ...state,
        user: {
          ...state.user,
          balance,
          cardDetails,
          transactions: [transaction, ...user.transactions]
        },
        pending: state.pending.filter(e => e !== 'topup')
      };
    }
    case TOPUP_FAILURE: {
      const { error, cardError } = action;
      return {
        ...state,
        error: {
          inline: cardError,
          fullPage: error
        },
        pending: state.pending.filter(e => e !== 'topup')
      };
    }
    case PURCHASE_REQUEST:
      return addPendingRequest('purchase', state);
    case PURCHASE_SUCCESS: {
      const { balance, transaction } = action.response;
      const { user } = state;
      return {
        ...state,
        user: {
          ...user,
          balance,
          transactions: [transaction, ...user.transactions]
        },
        pending: state.pending.filter(e => e !== 'purchase')
      };
    }
    case PURCHASE_FAILURE:
      return showFullPageError('purhcase', action.error, state);
    case STORE_REQUEST:
      return addPendingRequest('store', state);
    case STORE_SUCCESS: {
      return {
        ...state,
        ...action.response,
        pending: state.pending.filter(e => e !== 'store')
      };
    }
    case STORE_FAILURE:
      return showFullPageError('store', action.error, state);
    case SURVEY_REQUEST:
      return addPendingRequest('survey', state);
    case SURVEY_SUCCESS: {
      return {
        ...state,
        survey: action.response,
        pending: state.pending.filter(e => e !== 'survey')
      };
    }
    case SURVEY_FAILURE:
      return showFullPageError('survey', action.error, state);
    case MARKETPLACE_REQUEST:
      return addPendingRequest('marketplace', state);
    case MARKETPLACE_SUCCESS: {
      return {
        ...state,
        pending: state.pending.filter(e => e !== 'marketplace')
      };
    }
    case MARKETPLACE_FAILURE:
      return showFullPageError('marketplace', action.error, state);
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
    case LOCAL_STORAGE_SAVE_ERROR: {
      return {
        ...state,
        error: {
          fullPage: action.error
        }
      };
    }
    case BOX_RECEIVED_REQUEST: {
      const { boxId } = action;
      return {
        ...state,
        pending: [...state.pending, 'box-received'],
        lastBoxIdMarkedAsReceived: boxId
      };
    }
    case BOX_RECEIVED_SUCCESS: {
      const { store } = action.response;
      return {
        ...state,
        store,
        pending: state.pending.filter(e => e !== 'box-received')
      };
    }
    case BOX_RECEIVED_FAILURE: {
      return {
        ...showFullPageError('box-received', action.error, state),
        lastBoxIdMarkedAsReceived: null
      };
    }
    default: {
      return state;
    }
  }
};
