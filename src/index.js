import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory } from 'react-router'
import App from './App';
import BuyScreen from './buy-screen/BuyScreen';
import StoreScreen from './store-screen/StoreScreen';
import './index.css';

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      // TODO this should be a link from the Buy buttons, not a route in here
      <Route path="/buy" component={BuyScreen}/>
      <Route path="/:name" component={StoreScreen}/>
    </Route>
  </Router>
), document.getElementById('root'));
