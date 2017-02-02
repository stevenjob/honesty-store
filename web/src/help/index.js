import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Button from '../chrome/button';
import Page from '../chrome/page';
import { performSupport } from '../actions/support';
import isRegisteredUser from '../reducers/is-registered-user';
import './index.css';


const Store = () =>
  <Link to={`/store`} className="help-title-store">
    <h5>Store</h5>
  </Link>;

const Help = class extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      message: ''
    };
  }

  handleChange(event) {
    const message = event.target.value;
    this.setState({ message });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { message } = this.state;
    const { performSupport } = this.props;
    if (message !== '') {
      performSupport({ message });
    }
  }

  render() {
    const { registered } = this.props;
    return <Page title="Help"
      left={registered ? null : <Store />}
      nav={registered}>
      <form className="help" onSubmit={(e) => this.handleSubmit(e)}>
        <h2>Having problems?</h2>
        <p>
          <textarea rows="8"
            name="emailAddress"
            placeholder="We've automatically captured your account details, please describe your problem here"
            onChange={(e) => this.handleChange(e)} />
        </p>
        <p><Button onClick={(e) => this.handleSubmit(e)}>Send to Customer Support</Button></p>
      </form>
    </Page>;
  }
};

const mapStateToProps = ({ user }) => ({
  registered: isRegisteredUser(user)
});

const mapDispatchToProps = { performSupport };

export default connect(mapStateToProps, mapDispatchToProps)(Help);
