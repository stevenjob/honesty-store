import React from 'react';
import history from '../history';
import { Success } from '../layout/alert';

export default class ReceivedBox extends React.Component {

  componentDidMount() {
    console.log('Send support message here');
  }

  render() {
    return <Success title="Feel free to put the box out & we'll enable the items shortly"
      subtitle="Great to hear your box has arrived!"
      onClick={() => history.replace(`/store`)} />;
  }
}
