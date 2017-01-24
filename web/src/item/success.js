import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import Page from '../chrome/page';
import './success.css';

const ItemPurchaseSuccess = ({
    loading,
    storeId,
    item: { id, name, price }
}) => {
    return (
        <Page
            invert={true}
            nav={false}
            fullscreen={true}
            loading={loading}
        >
            <div onClick={() => browserHistory.replace(`/${storeId}/history`)} className="item-success">
                <div className="item-success-detail">
                    <h3>Enjoy your {name}</h3>
                    <div className="item-success-detail-image">
                        <img src={require("../store/assets/packet.svg")} alt="NAME HERE" />
                    </div>
                </div>
                <h3>Thank you for your honesty!</h3>
            </div>
        </Page>
    );
};

const mapStateToProps = (
    { store: { items = [] } },
    { params: { storeId, itemId } }
) => {
    const item = items.find(el => el.id === itemId);
    return {
        storeId,
        loading: item == null,
        item: item || {}
    };
};

export default connect(mapStateToProps)(ItemPurchaseSuccess);