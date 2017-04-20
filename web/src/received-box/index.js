import React from 'react';
import { connect } from 'react-redux';
import { performSupport } from '../actions/support';

class ReceivedBox extends React.Component {

  componentDidMount() {
    const { params: { boxId }, emailAddress, performSupport } = this.props;
    const message = `Box ${boxId} has arrived`;
    performSupport({ emailAddress, message }, '/box/received/success');
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return null;
  }
}

const mapStateToProps = (
  { user: { emailAddress } },
  { params: { boxId } }
) => ({
  emailAddress,
  boxId
});

export default connect(mapStateToProps, { performSupport })(ReceivedBox);
