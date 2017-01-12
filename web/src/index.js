import React from 'react';
import ReactDOM from 'react-dom';
import { IndexRedirect, Router, Route, hashHistory } from 'react-router'
import Root from './chrome/root';
import Intro from './intro/intro';
import StoreTitle from './store/title';
import StoreList from './store/list';
import HistoryTitle from './history/title';
import HistoryList from './history/list';
import ProfileTitle from './profile/title';
import Profile from './profile/profile';
import HelpTitle from './help/title';
import Help from './help/help';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import reducer from './reducers/reducer';
import { performFullRegistration } from './actions/register';

const middlewares = [thunkMiddleware];

if (process.env.NODE_ENV === `development`) {
  const logger = createLogger();
  middlewares.push(logger);
}

const store = createStore(
  reducer,
  applyMiddleware(...middlewares)
);

store.dispatch(performFullRegistration('NCL'));

ReactDOM.render((
  <Router history={hashHistory} onUpdate={() => scrollTo(0, 0)}>
    <Route path="/" component={Intro}/>
    <Route path="/:storeId" component={Root}>
      <IndexRedirect to="store"/>
      <Route path="store" components={{title: StoreTitle, body: StoreList}}/>
      <Route path="history" components={{title: HistoryTitle, body: HistoryList}}/>
      <Route path="profile" components={{title: ProfileTitle, body: Profile}}/>
      <Route path="help" components={{title: HelpTitle, body: Help}}/>
    </Route>
  </Router>
), document.getElementById('root'));