import React from 'react';
import { connect } from 'react-redux';
import Button from '../chrome/button';
import { performRegister } from '../actions/register';
import logo from '../chrome/assets/logo.svg';
import './index.css';

const extractStoreCode = (url) => {
  const [storeCode] = url.match(/([^/]*)$/);
  return storeCode === 'honesty.store' ? '' : storeCode;
};

class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      storeCode: ''
    };
  }

  handleStoreCodeChange(event) {
    const { value } = event.target;
    const storeCode = extractStoreCode(value);
    this.setState({
      storeCode: `https://honesty.store/${storeCode}`
    });
  }

  openStore(e) {
    e.preventDefault();
    const { performRegister } = this.props;
    const storeCode = extractStoreCode(this.state.storeCode);
    if (storeCode !== '') {
      performRegister({ storeCode });;
    }
  }

  render() {
    const { storeCode } = this.state;
    return <div className="home">
      <h1>
        <img src={logo} alt="honesty.store" />
      </h1>
      <h3>Welcome to honesty.store</h3>
      <p>We're currently alpha testing our new service at a limited number of locations.</p>
      <p>If you have a store code and want to sign up, please enter it below</p>
      <form onSubmit={(e) => this.openStore(e)}>
        <p className="home-store-code">
          <input name="storeCode"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            value={storeCode}
            type="text"
            placeholder="https://honesty.store/your-store-code"
            onFocus={(e) => this.handleStoreCodeChange(e)}
            onChange={(e) => this.handleStoreCodeChange(e)} />
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
          <input name="EMAIL" autoComplete="email" type="email" />
        </p>
        <p>
          <Button onClick={() => document.forms.update.submit()}>Keep Me Updated</Button>
        </p>
      </form>
    </div>;
  }
}

export default connect(() => ({}), { performRegister })(Home);