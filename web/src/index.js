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
import Balance from './topup/balance';
import Card from './topup/card';
import AddCard from './topup/add-card';
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
        <Route path="store" component={Store}/>
        <Route path="topup/balance" component={Balance}/>
        <Route path="topup/card/:amount" component={Card}/>
        <Route path="topup/addcard/:amount" component={AddCard}/>
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
