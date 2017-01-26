import React from 'react';
import { connect } from 'react-redux';
import NavBar from './nav-bar';
import { BRAND_DARK, BRAND_WHITE, LIGHT_TEXT } from './colors';
import './page.css';

const Loading = () => <div className="chrome-page-loading">
  <h1>Loading</h1>
</div>;

const headerStyles = (invert) => invert ?
  { borderColor: BRAND_WHITE, background: BRAND_WHITE, color: BRAND_DARK } :
  { borderColor: BRAND_WHITE, background: BRAND_DARK, color: LIGHT_TEXT };

const Page = ({
  title,
  subtitle,
  left,
  right,
  invert = false,
  children,
  nav = true,
  fullscreen,
  loading
}) =>
  <div className="chrome-page">
    <header className="chrome-page-title-bar" style={headerStyles(invert)}>
      { (right || left) && !loading &&
        <div className="chrome-page-title-bar-left">
          { left }
        </div>
      }
      <div className="chrome-page-title-bar-middle">
        <h1>{title}</h1>
        { subtitle &&
          <h2>{subtitle}</h2>
        }
      </div>
      { (right || left) && !loading &&
        <div className="chrome-page-title-bar-right">
          { right }
        </div>
      }
    </header>
    <section style={{color: BRAND_DARK }} className={fullscreen ? 'chrome-page-section-fullscreen chrome-page-section' : 'chrome-page-section'}>
      { loading ? <Loading/> : children }
    </section>
    { nav && <NavBar/> }
  </div>;

const mapStateToProps = ({ user, pending }) => ({
  loading: pending.length > 0
});

export default connect(mapStateToProps, {})(Page);
