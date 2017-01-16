import React from 'react';
import { Link } from 'react-router';

export default ({ params: { storeId } }) =>
    <div>
        <h1>Want to close your account?</h1>
        <p>If you want to report a close your account and receive a refund of your remaining balance please chat with customer support.</p>
        <p><Link to={`/${storeId}/help`}>Chat</Link></p>
        <p><Link to={`/${storeId}/profile`}>Not Now</Link></p>
    </div>;