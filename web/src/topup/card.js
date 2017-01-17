import React from 'react';
import { Link } from 'react-router';
import { BRAND_LIGHT, MUTED_TEXT, LIGHT_TEXT } from '../chrome/colors';
import Button from '../chrome/button';
import Page from '../chrome/page';
import { Back } from '../chrome/link';
import './card.css';

export default ({ params: { storeId, amount }, brand = 'visa' }) =>
    <Page left={<Back>Balance</Back>}
        title={`£${amount} Top Up`}
        storeId={storeId}
        invert={true}
        nav={false}
        fullscreen={true}>
        <div className="topup-card">
            <h4>Please check this is the card you want to top up £{amount} from</h4>
            <div className="topup-card-chooser">
                <div className="topup-card-selected">
                    <div className="topup-card-selected-background"/>
                    <div className={`topup-card-selected-${brand}`}/>
                    <p className="topup-card-selected-number" style={{color: MUTED_TEXT }}>
                        <span>****</span>
                        <span>****</span>
                        <span>****</span>
                        <span style={{color: LIGHT_TEXT }}>3927</span>
                    </p>
                    <p className="topup-card-selected-expiry" style={{color: LIGHT_TEXT }}>04/18</p>
                </div>
                <p>
                    <Link to={`/${storeId}/topup/addcard/5`} style={{color: BRAND_LIGHT}}>Add a different card</Link>
                </p>
            </div>
            <p className="topup-card-topup">
                <Button to={`/${storeId}/topup/success`}>Confirm £{amount} Top Up</Button>
                <Link to={`/${storeId}/topup/error`}>ERROR</Link>
            </p>
        </div>
    </Page>;
