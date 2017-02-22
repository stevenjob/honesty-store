import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute } from 'react-router';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import App from './app';
import Home from './home/index';
import HomeSuccess from './home/success';
import Store from './store/index';
import History from './history/index';
import Profile from './profile/index';
import CloseProfile from './profile/close';
import EditProfile from './profile/edit';
import LogoutProfile from './profile/logout';
import TopupAmount from './topup/amount';
import TopupExistingCard from './topup/existing-card';
import TopupNewCard from './topup/new-card';
import TopupSuccess from './topup/success';
import RegisterEmail from './register/email';
import RegisterCard from './register/card';
import RegisterSuccessWithPurchase from './register/success-with-purchase';
import RegisterSuccessWithoutPurchase from './register/success-without-purchase';
import RegisterPartialSuccess from './register/partial-success';
import SignInSuccess from './signin/success';
import Help from './help/index';
import HelpSuccess from './help/success';
import ItemDetail from './item/detail';
import ItemPurchaseSuccess from './item/success';
import ConfirmStoreChange from './confirm-store-change/index';
import reducer from './reducers/reducer';
import { performInitialise } from './actions/inititialise';
import './chrome/style';
import history from './history';


const middlewares = [thunkMiddleware];

if (process.env.NODE_ENV === `development`) {
  const logger = createLogger();
  middlewares.push(logger);
}

const store = createStore(
  reducer,
  applyMiddleware(...middlewares)
);

store.dispatch(performInitialise({}));


const redirectUnauthorised = (nextState, replace) => {
  const { refreshToken } = store.getState();

  if (!refreshToken){
    replace('/');
  }
};

ReactDOM.render((
  <Provider store={store}>
    <Router history={history} onUpdate={() => scrollTo(0, 0)}>
      <Route path="/" component={App} >
        <IndexRoute component={Home} />
        <Route path="success" component={HomeSuccess} />
        <Route path="register" component={RegisterEmail} onEnter={redirectUnauthorised} />
        <Route path="register/:itemId" component={RegisterEmail} onEnter={redirectUnauthorised} />
        <Route path="register//success" component={RegisterSuccessWithoutPurchase} onEnter={redirectUnauthorised} />
        <Route path="register/:itemId/success" component={RegisterSuccessWithPurchase} onEnter={redirectUnauthorised} />
        <Route path="register/:itemId/partial" component={RegisterPartialSuccess} onEnter={redirectUnauthorised} />
        <Route path="register//:emailAddress" component={RegisterCard} onEnter={redirectUnauthorised} />
        <Route path="register/:itemId/:emailAddress" component={RegisterCard} onEnter={redirectUnauthorised} />
        <Route path="signin/success" component={SignInSuccess} />
        <Route path="store" component={Store} onEnter={redirectUnauthorised} />
        <Route path="store/change/:storeCode" component={ConfirmStoreChange} onEnter={redirectUnauthorised} />
        <Route path="item/:itemId" component={ItemDetail} onEnter={redirectUnauthorised} />
        <Route path="item/:itemId/success" component={ItemPurchaseSuccess} onEnter={redirectUnauthorised} />
        <Route path="topup" component={TopupAmount} onEnter={redirectUnauthorised} />
        <Route path="topup/success" component={TopupSuccess} onEnter={redirectUnauthorised} />
        <Route path="topup/:amount" component={TopupExistingCard} onEnter={redirectUnauthorised} />
        <Route path="topup/:amount/new" component={TopupNewCard} onEnter={redirectUnauthorised} />
        <Route path="history" component={History} onEnter={redirectUnauthorised} />
        <Route path="profile" component={Profile} onEnter={redirectUnauthorised} />
        <Route path="profile/close" component={CloseProfile} onEnter={redirectUnauthorised} />
        <Route path="profile/edit" component={EditProfile} onEnter={redirectUnauthorised} />
        <Route path="profile/logout" component={LogoutProfile} onEnter={redirectUnauthorised} />
        <Route path="help" component={Help} onEnter={redirectUnauthorised} />
        <Route path="help/success" component={HelpSuccess} onEnter={redirectUnauthorised} />
        <Route path=":storeCode"
          onEnter={(nextState, replace) => {
            const { params: { storeCode }, location: { query: { code: emailToken } } } = nextState;
            store.dispatch(performInitialise({ storeCode, emailToken }));
            replace('/store');
          } } />
      </Route>
    </Router>
  </Provider>
), document.getElementById('root'));

requestAnimationFrame(() => {
  document.documentElement.className = 'loaded';
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }
    catch (e) {
      console.log('ServiceWorker registration failed: ', e);
    }
  });
}
