import React from 'react';
import ReactDOM from 'react-dom';
import { IndexRedirect, Router, Route, hashHistory } from 'react-router'
import Root from './chrome/root';
import Intro from './intro/intro';
import Store from './store/list';
import History from './history/list';
import Profile from './profile/profile';
import Help from './help/help';

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/" component={Intro}/>
    <Route path="/:storeId" component={Root}>
      <IndexRedirect to="store"/>
      <Route path="store" component={Store}/>
      <Route path="history" component={History}/>
      <Route path="profile" component={Profile}/>
      <Route path="help" component={Help}/>
    </Route>
  </Router>
), document.getElementById('root'));