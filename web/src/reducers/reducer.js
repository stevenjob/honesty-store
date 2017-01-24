import { REGISTER_REQUEST, REGISTER_SUCESSS, REGISTER_FAILURE } from '../actions/register';
import { REGISTER2_REQUEST, REGISTER2_SUCESSS, REGISTER2_FAILURE } from '../actions/register2';
import { SESSION_REQUEST, SESSION_SUCCESS, SESSION_FAILURE } from '../actions/session';
import { TOPUP_REQUEST, TOPUP_SUCCESS, TOPUP_FAILURE } from '../actions/topup';
import { PURCHASE_REQUEST, PURCHASE_SUCCESS, PURCHASE_FAILURE } from '../actions/purchase';
import { LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_FAILURE } from '../actions/logout';
import { SUPPORT_REQUEST, SUPPORT_SUCCESS, SUPPORT_FAILURE } from '../actions/support';
import { SIGNIN_REQUEST, SIGNIN_SUCCESS, SIGNIN_FAILURE } from '../actions/signin';
import { SIGNIN2_REQUEST, SIGNIN2_SUCCESS, SIGNIN2_FAILURE } from '../actions/signin2';

const getInitialState = () => {
  return {
    pending: [],
    user: {},
    store: {},
    register: {},
    accessToken: null,
    refreshToken: localStorage.refreshToken
  };
};

export default (state = getInitialState(), action) => {
  switch (action.type) {
    case REGISTER_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'register']
      };
    }
    case  REGISTER_SUCESSS: {
      const { refreshToken } = action.response;
      localStorage.refreshToken = refreshToken;
      return {
        ...state,
        ...action.response,
        pending: state.pending.filter(e => e !== 'register')
      };
    }
    case  REGISTER_FAILURE: {
      return {
        ...state,
        pending: state.pending.filter(e => e !== 'register')
      };
    }
    case SIGNIN_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'signin']
      };
    }
    case  SIGNIN_SUCCESS: {
      return {
        ...state,
        pending: state.pending.filter(e => e !== 'signin')
      };
    }
    case  SIGNIN_FAILURE: {
      return {
        ...state,
        pending: state.pending.filter(e => e !== 'signin')
      };
    }
    case SIGNIN2_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'signin2']
      };
    }
    case  SIGNIN2_SUCCESS: {
      const { refreshToken } = action.response;
      localStorage.refreshToken = refreshToken;
      return {
        ...state,
        ...action.response,
        pending: state.pending.filter(e => e !== 'signin2')
      };
    }
    case  SIGNIN2_FAILURE: {
      return {
        ...state,
        pending: state.pending.filter(e => e !== 'signin2')
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
      const { user, store } = action.response;
      return {
        ...state,
        user: user,
        store: store,
        pending: state.pending.filter(e => e !== 'register2')
      };
    }
    case  REGISTER2_FAILURE: {
      const { error } = action;
      return {
        ...state,
        register: {
          error
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
    case  SESSION_FAILURE: {
      return {
        ...state,
        pending: state.pending.filter(e => e !== 'session')
      };
    }
    case SUPPORT_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'support']
      };
    }
    case SUPPORT_SUCCESS: {
      return {
        ...state,
        pending: state.pending.filter(e => e !== 'support')
      };
    }
    case  SUPPORT_FAILURE: {
      return {
        ...state,
        pending: state.pending.filter(e => e !== 'support')
      };
    }
    case LOGOUT_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'logout']
      };
    }
    case LOGOUT_SUCCESS: {
      delete localStorage.refreshToken;
      return getInitialState();
    }
    case LOGOUT_FAILURE: {
      return {
        ...state,
        pending: state.pending.filter(e => e !== 'logout')
      };
    }
    case TOPUP_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'topup']
      };
    }
    case TOPUP_SUCCESS: {
      const { balance, transaction } = action.response;
      const { user } = state;
      return {
        ...state,
        user: {
          ...state.user,
          balance,
          transactions: [transaction, ...user.transactions]
        },
        pending: state.pending.filter(e => e !== 'topup')
      };
    }
    case TOPUP_FAILURE: {
      return {
        ...state,
        pending: state.pending.filter(e => e !== 'topup')
      };
    }
    case PURCHASE_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'purchase']
      };
    }
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
    case PURCHASE_FAILURE: {
      return {
        ...state,
        pending: state.pending.filter(e => e !== 'purchase')
      };
    }
    default:
      return state;
  }
};
