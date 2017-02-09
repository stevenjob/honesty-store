import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Button from '../chrome/button';
import Page from '../chrome/page';
import { DANGER } from '../chrome/colors';
import { performSupport } from '../actions/support';
import isRegisteredUser from '../reducers/is-registered-user';
import isEmail from 'validator/lib/isEmail';
import './index.css';


const Store = () =>
  <Link to={`/store`} className="help-title-store">
    <h5>Store</h5>
  </Link>;

const Help = class extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      message: '',
      emailAddress: props.emailAddress || ''
    };
  }

  handleMessageChange(event) {
    const message = event.target.value;
    this.setState({ message });
  }

  handleEmailChange(event) {
    const emailAddress = event.target.value;
    this.setState({ emailAddress });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { performSupport } = this.props;
    const { emailAddress, message } = this.state;
    const valid = isEmail(emailAddress);
    this.setState({ valid });
    if (valid && message !== '') {
      performSupport({ message, emailAddress });
    }
  }

  style() {
    const { valid } = this.state;
    return valid === false ? { borderBottomColor: DANGER } : {};
  }

  render() {
    const { valid, emailAddress } = this.state;
    const { registered } = this.props;
    return <Page title="Help"
      left={registered ? null : <Store />}
      nav={registered}>
      <form className="help" onSubmit={(e) => this.handleSubmit(e)}>
        <h2>Having problems?</h2>
        <p>
          <textarea rows="8"
            name="message"
            placeholder="Please describe your problem here"
            onChange={(e) => this.handleMessageChange(e)}/>
        </p>
        {
          valid !== false ?
            <p>Please enter your email address below</p>
            :
            <p style={{ color: DANGER }}>Please enter a valid email address</p>
        }
        <p>
          <input type="email"
            name="emailAddress"
            disabled={registered}
            value={emailAddress}
            placeholder="honest.jo@honesty.store"
            style={this.style()}
            onChange={(e) => this.handleEmailChange(e)}/>
        </p>
        <p><Button onClick={(e) => this.handleSubmit(e)}>Send to Customer Support</Button></p>
      </form>
    </Page>;
  }
};

const mapStateToProps = ({ user }) => ({
  emailAddress: user.emailAddress,
  registered: isRegisteredUser(user)
});

const mapDispatchToProps = { performSupport };

export default connect(mapStateToProps, mapDispatchToProps)(Help);
