import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { NotNow } from '../chrome/link';
import isEmail from 'validator/lib/isEmail';
import { performSignin } from '../actions/signin';
import Full from '../layout/full';

class Email extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emailAddress: ''
    };
  }

  handleChange(event) {
    const emailAddress = event.target.value;
    this.setState({ emailAddress });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { performSignin, params: { itemId }, storeCode } = this.props;
    const { emailAddress } = this.state;
    const valid = isEmail(emailAddress);
    this.setState({ valid });
    if (valid) {
      performSignin({ itemId, emailAddress, storeCode });
    }
  }

  render() {
    const { valid } = this.state;
    return (
      <Full left={<NotNow />}>
        <form onSubmit={e => this.handleSubmit(e)}>
          <h2>Want to sign up or sign in?</h2>
          {valid !== false
            ? <p>Please enter your email address below</p>
            : <p className="red">Please enter a valid email address</p>}
          <p>
            <input
              type="email"
              name="emailAddress"
              autoComplete="email"
              placeholder="honest.jo@honesty.store"
              onChange={e => this.handleChange(e)}
              className={valid !== false ? 'input' : 'input border-red'}
            />
          </p>
          <p>
            <Link
              className="btn btn-primary"
              onClick={e => this.handleSubmit(e)}
            >
              Continue
            </Link>
          </p>
          <p><Link to={`/help`}>Problems signing in?</Link></p>
        </form>
      </Full>
    );
  }
}

const mapStateToProps = ({ store: { code } }, { params: { itemId } }) => ({
  itemId,
  storeCode: code
});

const mapDispatchToProps = { performSignin };

export default connect(mapStateToProps, mapDispatchToProps)(Email);
