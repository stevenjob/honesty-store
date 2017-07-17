import React from 'react';
import sucess from '../../chrome/assets/success.svg';
import history from '../../history';

export default () => (
  <div
    className="absolute top-0 right-0 bottom-0 left-0 flex flex-column justify-center navy center p2"
    onClick={() => history.push('/store')}
  >
    <div className={`col-6 mx-auto layout-alert-success`}>
      <img src={sucess} alt="" />
    </div>
    <h3>Thanks for adding an item!</h3>
    <p>
      We will email you shortly to confirm your listing and let you know when you can put your items out for sale.
    </p>
    <p>
      To make sure all transactions are accounted for, we recommend that you don't put your items out until they are listed.
    </p>
    <p className="gray">Tap to dismiss</p>
  </div>
);
