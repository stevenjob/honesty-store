import React from 'react';
import { Link } from 'react-router';
import { BRAND_LIGHT, DANGER, LIGHT_TEXT } from '../chrome/colors';
import './button.css';

const style = (type) => {
    switch (type) {
        case 'danger':
            return { background: DANGER, color: LIGHT_TEXT };
        default:
            return { background: BRAND_LIGHT, color: LIGHT_TEXT };
    }
};

export default ({ children, to, onClick, type }) =>
    <Link className="chrome-button" to={to} onClick={onClick} style={style(type)}>
        {children}
    </Link>;