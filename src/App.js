import React, { Component } from 'react';
import AppHeader from './AppHeader';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
          <AppHeader />
          {this.props.children}
      </div>
    );
  }
}

export default App;
