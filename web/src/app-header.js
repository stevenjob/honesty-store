import React from 'react';
import { PageHeader } from 'react-bootstrap';
import './app-header.css';

class AppHeader extends React.Component {
  render() {
    return (
      <PageHeader className="app-header">Honesty Store</PageHeader>
    );
  }
}

export default AppHeader;
