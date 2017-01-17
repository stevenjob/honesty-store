import React from 'react';
import Button from '../chrome/button';
import { BRAND_LIGHT, MUTED_TEXT } from '../chrome/colors';
import './stepper.css';

export default ({ queryText, to, submitText, stepperSymbol, stepperValue }) =>
  <div className="stepper">
    <h2>{queryText}</h2>
    <div className="stepper-amount">
      <Button>-</Button>
      <h1 style={{color: BRAND_LIGHT}}>
        <small>{stepperSymbol}</small>{stepperValue}
      </h1>
      <Button>+</Button>
    </div>
    <p style={{color: MUTED_TEXT}}>Your balance will be<br/>£11.45</p>
    <p><Button to={to}>{submitText}</Button></p>
  </div>;