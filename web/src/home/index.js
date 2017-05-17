import React from 'react';
import { connect } from 'react-redux';
import StoreBrowser from '../chrome/store-browser';
import { performRegister } from '../actions/register';
import logo from '../chrome/assets/logo.svg';
import Full from '../layout/full';

const Home = ({ performRegister }) => (
  <Full>
    <h1>
      <img src={logo} alt="honesty.store" />
    </h1>
    <h3>Welcome to honesty.store</h3>
    <p>
      We're currently alpha testing our new service at a limited number of locations.
    </p>
    <p>If you have a store code and want to sign up, please enter it below</p>
    <StoreBrowser
      onSubmit={storeCode => performRegister({ storeCode })}
      buttonText="Browse Store"
      storePlaceholder="your-store-code"
    />

    <p>
      If you don't have a store code but would like to find out more, please enter your email address below
    </p>
    <form
      name="update"
      action="//store.us15.list-manage.com/subscribe/post?u=68a302ac8cda582adcf5d3759&amp;id=5bc29617b3"
      method="post"
      target="_NEW"
    >
      <p>
        <input
          name="EMAIL"
          className="input"
          autoComplete="email"
          type="email"
        />
      </p>
      <p>
        <a
          className="btn btn-primary"
          onClick={() => document.forms.update.submit()}
        >
          Keep Me Updated
        </a>
      </p>
    </form>
  </Full>
);

export default connect(() => ({}), { performRegister })(Home);
