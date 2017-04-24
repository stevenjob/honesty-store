import React from 'react';
import { connect } from 'react-redux';
import { performBoxReceived } from '../actions/box-received';

class ReceivedBox extends React.Component {

  componentDidMount() {
    const { params: { boxId }, performBoxReceived } = this.props;
    performBoxReceived({ boxId });
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

export default connect(mapStateToProps, { performBoxReceived })(ReceivedBox);
