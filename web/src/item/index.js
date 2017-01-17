import React from 'react';
import { Link } from 'react-router';
import Page from '../chrome/page';
import Stepper from '../chrome/stepper';
import { BRAND_LIGHT } from '../chrome/colors';
import './index.css';

const getBackLink = (storeId) => <Link 
    style={{color: BRAND_LIGHT}}
    to={`/${storeId}/store`}
  >
    Close
  </Link>;

export default ({ params: { storeId } }) =>
  <Page 
    storeId={storeId}
    invert={true}
    nav={false}
    fullscreen={true}
    left={getBackLink(storeId)}
  >
    <div className="item">
      <div className="item-details">
        <h1>Dairy Milk Freddo Caramel</h1>
        <h2>55<small>p</small></h2>
        <img src={require('../store/assets/packet.svg')} alt=""/>
      </div>
      <Stepper
        queryText="How many would you like to pay for?"
        submitText="Pay for 1 Freddo Caramel"
        stepperValue={1}
      />
    </div>
  </Page>;
