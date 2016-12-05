import React, { Component } from 'react';
import AppHeader from './AppHeader';
import Store from './Store';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
          <AppHeader />
          <Store name="Newcastle"/>
      </div>
    );
  }
}

export default App;
