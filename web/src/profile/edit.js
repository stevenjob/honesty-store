import React from 'react';
import { Link } from 'react-router';

export default ({ params: { storeId } }) =>
    <div>
        <h1>Want to update?</h1>
        <p>If you want to report a change of email address or update any of your personal information please chat with customer support.</p>
        <p><Link to={`/${storeId}/help`}>Chat</Link></p>
        <p><Link to={`/${storeId}/profile`}>Not Now</Link></p>
    </div>;