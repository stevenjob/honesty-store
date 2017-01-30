import React from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { Success } from '../chrome/modal';

export const RegisterSuccess = ({ image }) =>
    <Success title={`Enjoy your ${name}!`}
        subtitle="Thank you for signing up!"
        image={require(`../item/assets/${image}`)}
        onClick={() => browserHistory.replace(`/history`)}/>;

const mapStateToProps = (
    { store: { items = [] } },
    { params: { itemId } }
) => {
    const item = items.find(item => item.id === itemId);
    return {
        item: item || {}
    };
};

export default connect(mapStateToProps)(RegisterSuccess);
