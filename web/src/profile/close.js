import React from 'react';
import { Link } from 'react-router';
import Page from '../chrome/page';

export default ({ params: { storeId } }) =>
    <Page left={<Link to={`/${storeId}/profile`}>Not Now</Link>}
        title="Close Account"
        storeId={storeId}
        invert={true}
        nav={false}>
        <div>
            <h1>Want to close your account?</h1>
            <p>If you want to close your account and receive a refund of your remaining balance please chat with customer support.</p>
            <p><Link to={`/${storeId}/help`}>Chat</Link></p>
        </div>
    </Page>;