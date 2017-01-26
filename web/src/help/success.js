import React from 'react';
import { browserHistory } from 'react-router';
import { Success } from '../chrome/modal';

export default ({ params: { storeId }}) =>
    <Success title="We've received your message and will be back in touch shortly"
        subtitle="Sorry your having problems!"
        onClick={() => browserHistory.replace(`/${storeId}`)} />;
