import React from 'react';
import { Link } from 'react-router';
import { BRAND_LIGHT } from '../chrome/colors';
import Button from '../chrome/button';
import Page from '../chrome/page';

export default ({ params: { storeId } }) =>
    <Page left={<Link style={{color: BRAND_LIGHT}} to={`/${storeId}/profile`}>Not Now</Link>}
        title="Edit Profile"
        storeId={storeId}
        invert={true}
        nav={false}>
        <div>
            <h1>Want to update?</h1>
            <p>If you want to report a change of email address or update any of your personal information please chat with customer support.</p>
            <p><Button to={`/${storeId}/help`}>Chat to Customer Support</Button></p>
        </div>
    </Page>;