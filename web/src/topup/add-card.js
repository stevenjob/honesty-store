import React from 'react';
import { Link } from 'react-router';
import { BRAND_LIGHT } from '../chrome/colors';
import Button from '../chrome/button';
import Page from '../chrome/page';

export default ({ params: { storeId, amount } }) =>
    <Page left={<Link className="chrome-link-back" style={{color: BRAND_LIGHT}} to={`/${storeId}/topup/card/${amount}`}>Card</Link>}
        title={`£${amount} Top Up`}
        storeId={storeId}
        invert={true}
        nav={false}
        fullscreen={true}>
        <div>
            <h1>Want to add a different card?</h1>
            <p>If you want to add or change your card details please chat with customer support.</p>
            <p><Button to={`/${storeId}/help`}>Chat to Customer Support</Button></p>
        </div>
    </Page>;