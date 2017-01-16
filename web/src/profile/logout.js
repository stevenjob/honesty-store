import React from 'react';
import { Link } from 'react-router';

export default ({ params: { storeId } }) =>
    <div>
        <h1>Want to logout?</h1>
        <p>You can always login again using your email address.</p>
        <p><Link to={`/logout`}>Logout</Link></p>
        <p><Link to={`/${storeId}/profile`}>Not Now</Link></p>
    </div>;