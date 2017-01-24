import React from 'react';
import { hashHistory } from 'react-router';
import { BRAND_DARK, BRAND_LIGHT } from '../chrome/colors';
import Button from '../chrome/button';
import './index.css';

export default class extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      storeId: ''
    };
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  openStore(e) {
    e.preventDefault();
    const { storeId } = this.state;
    if (storeId !== '') {
      hashHistory.push(`/${storeId}`);
    }
  }

  render() {
    const { storeId } = this.state;
    return <div className="home">
      <h1>
        <span style={{ color: BRAND_DARK }}>honesty</span>
        <span style={{ color: BRAND_LIGHT }}>.store</span>
      </h1>
      <h3>Welcome to honesty.store</h3>
      <p>We're currently alpha testing our new service at a limited number of locations.</p>
      <p>If you have a store code and want to sign up, please enter it below</p>
      <form onSubmit={(e) => this.openStore(e)}>
        <p className="home-store-code">
          <input name="storeId" value={storeId} type="text" placeholder="your-store-code" onChange={(e) => this.handleChange(e)}/>
        </p>
        <p>
          <Button onClick={(e) => this.openStore(e)}>Browse Store</Button>
        </p>
      </form>
      <p>If you don't have a store code but would like to find out more, please enter your email address below</p>
      <form name="update"
        action="//store.us15.list-manage.com/subscribe/post?u=68a302ac8cda582adcf5d3759&amp;id=5bc29617b3"
        method="post"
        target="_NEW">
        <p>
          <input name="EMAIL" type="email" />
        </p>
        <p>
          <Button onClick={() => document.forms.update.submit()}>Keep Me Updated</Button>
        </p>
      </form>
    </div>;
  }
}
