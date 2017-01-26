import React from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { Success } from '../chrome/modal';
import currency from '../format/currency';

export const ItemPurchaseSuccess = ({ item: { name }, storeId }) =>
    <Success title={`Enjoy your ${name}!`}
        subtitle="Thank you for your honesty!"
        image={require("../store/assets/packet.svg")}
        onClick={() => browserHistory.replace(`/${storeId}/history`)}/>;

const mapStateToProps = (
    { store: { items = [] } },
    { params: { storeId, itemId } }
) => {
    const item = items.find(item => item.id === itemId);
    return {
        params: { storeId },
        item: item || {}
    };
};

export default connect(mapStateToProps)(ItemPurchaseSuccess);
