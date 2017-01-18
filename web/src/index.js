import React from 'react';
import ReactDOM from 'react-dom';
import { IndexRedirect, Router, Route, hashHistory } from 'react-router';
import { Provider } from 'react-redux';
import Root from './chrome/root';
import Intro from './intro/index';
import AboutInfo from './info/about';
import AppInfo from './info/app';
import PrivacyInfo from './info/privacy';
import TermsInfo from './info/terms';
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
import TopupError from './topup/error';
import RegisterEmail from './register/email';
import RegisterCard from './register/card';
import RegisterSuccess from './register/success';
import SignIn from './signin/index';
import SignInSuccess from './signin/success';
import Help from './help/index';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import reducer from './reducers/reducer';


const middlewares = [thunkMiddleware];

if (process.env.NODE_ENV === `development`) {
  const logger = createLogger();
  middlewares.push(logger);
}

const store = createStore(
  reducer,
  applyMiddleware(...middlewares)
);

ReactDOM.render((
  <Provider store={store}>
    <Router history={hashHistory} onUpdate={() => scrollTo(0, 0)}>
      <Route path="/" component={Intro}/>
      <Route path="/:storeId" component={Root}>
        <IndexRedirect to="store"/>
        <Route path="register/:itemId" component={RegisterEmail}/>
        <Route path="register/success" component={RegisterSuccess}/>
        <Route path="register/:itemId/:emailAddress" component={RegisterCard}/>
        <Route path="signin" component={SignIn}/>
        <Route path="signin/success" component={SignInSuccess}/>
        <Route path="store" component={Store}/>
        <Route path="topup" component={TopupAmount}/>
        <Route path="topup/success"component={TopupSuccess}/>
        <Route path="topup/error"component={TopupError}/>
        <Route path="topup/:amount"component={TopupExistingCard}/>
        <Route path="topup/:amount/new"component={TopupNewCard}/>
        <Route path="history" component={History}/>
        <Route path="profile" component={Profile}/>
        <Route path="profile/close" component={CloseProfile}/>
        <Route path="profile/edit" component={EditProfile}/>
        <Route path="profile/logout" component={LogoutProfile}/>
        <Route path="info/about" component={AboutInfo}/>
        <Route path="info/terms" component={TermsInfo}/>
        <Route path="info/privacy" component={PrivacyInfo}/>
        <Route path="info/app" component={AppInfo}/>
        <Route path="help" component={Help}/>
      </Route>
    </Router>
  </Provider>
), document.getElementById('root'));
