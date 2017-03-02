import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Chrome from '../layout/chrome';
import Balance from '../topup/balance';
import { performSupport } from '../actions/support';
import isRegisteredUser from '../reducers/is-registered-user';
import isEmail from 'validator/lib/isEmail';


const Store = () =>
  <Link className="btn" to={`/store`}>Store</Link>;

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

  render() {
    const { valid, emailAddress } = this.state;
    const { registered, balance, message } = this.props;
    return <Chrome title="Help"
      left={registered ? null : <Store />}
      right={registered ? <Balance balance={balance} /> : null}>
      <form className="center px2 navy" onSubmit={(e) => this.handleSubmit(e)}>
        <p>Having problems? Want to share an idea or some feedback?</p>
        <p>
          <textarea className="textarea"
            rows="8"
            name="message"
            placeholder="Please tell us all about it here"
            onChange={(e) => this.handleMessageChange(e)}
            value={message} />
        </p>
        {
          valid !== false ?
            <p>Please enter your email address below</p>
            :
            <p className="red">Please enter a valid email address</p>
        }
        <p>
          <input type="email"
            name="emailAddress"
            disabled={registered}
            value={emailAddress}
            placeholder="honest.jo@honesty.store"
            className={valid === false ? 'input border-red' : 'input'}
            onChange={(e) => this.handleEmailChange(e)}/>
        </p>
        <p>
          <Link className="btn btn-primary" onClick={(e) => this.handleSubmit(e)}>
            Send to Customer Support
          </Link>
        </p>
      </form>
    </Chrome>;
  }
};

const mapStateToProps = ({ user }) => ({
  emailAddress: user.emailAddress,
  registered: isRegisteredUser(user),
  balance: user.balance || 0
});

const mapDispatchToProps = { performSupport };

export default connect(mapStateToProps, mapDispatchToProps)(Help);
