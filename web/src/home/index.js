import React from 'react';
import { connect } from 'react-redux';
import StoreBrowser from '../chrome/store-browser';
import { performRegister } from '../actions/register';
import logo from '../chrome/assets/logo.svg';

import Hands from './assets/hands';
import '../item/hands.css';

const handsSize = '8rem';

const Home = ({ performRegister }) => (
  <div className="center navy col-12">
    <div className="bg-white py4">
      <div className="col-10 md-col-8 lg-col-6 mx-auto">
        <h1 className="my0 mx2">
          <img src={logo} alt="honesty.store" />
        </h1>
        <h3 className="regular">The digital honesty box</h3>

        <Hands
          className="hands py2 sm-my4"
          style={{ maxHeight: handsSize, minHeight: handsSize }}
        />

        <h4>Have a store code? Please enter it below</h4>
        <p className="mt0">
          (you will be able to find it on your honesty.store box)
        </p>
        <StoreBrowser
          onSubmit={storeCode => performRegister({ storeCode })}
          buttonText="Take me to my store"
          storePlaceholder="your-store-code"
        />
      </div>
    </div>
    <div className="bg-silver py4">
      <div className="col-10 md-col-8 lg-col-6 mx-auto">
        <h3>What is honesty.store?</h3>
        <p>
          We think vending machines are an outdated, cumbersome and distrustful
          concept in the modern workplace (and that's when they're working!). We
          want to do things differently, to save people time and money by
          offering a cheaper, more engagaing and more convenient service.
        </p>
        <p>
          We're currently alpha testing our new service at a limited number of
          locations. If you don't have a store code but would like to find out
          more, please enter your email address below.
        </p>

        <form
          name="update"
          action="//store.us15.list-manage.com/subscribe/post?u=68a302ac8cda582adcf5d3759&amp;id=5bc29617b3"
          method="post"
          target="_NEW"
        >
          <p className="col-12 lg-col-10 md-col-10 sm-col-10 mx-auto">
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
              Keep me updated
            </a>
          </p>
        </form>
      </div>
    </div>
    {/*backgroundImage: `url(${require('../chrome/assets/brochure-footer.svg')}`,*/}
    <div
      style={{
        backgroundRepeat: 'no-repeat',
        paddingBottom: '28%'
      }}
    />
  </div>
);

export default connect(() => ({}), { performRegister })(Home);
