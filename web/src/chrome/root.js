import React from 'react';
import { connect } from 'react-redux';
import NavBar from './nav-bar';
import { BRAND_DARK } from './colors';
import { performFullRegistration } from '../actions/register';
import './root.css';

class Root extends React.Component {
  componentDidMount() {
    const { dispatch, routeParams: { storeId }} = this.props;
    dispatch(performFullRegistration(storeId));
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.routeParams.storeId !== this.props.routeParams.storeId) {
      const { dispatch, routeParams: { storeId } } = nextProps;
      dispatch(performFullRegistration(storeId));
    }
  }
  render() {
    const { loading, title, body, routeParams: { storeId } } = this.props;
    return (
      <div className="chrome-root">
        {title}
        <section style={{color: BRAND_DARK }}>
          { loading ? "Loading..." : body }
        </section>
        <NavBar storeId={storeId}/>
      </div>
    );
  }
}

const mapStateToProps = ({ pending }) => ({
  loading: pending.length > 0
});

export default connect(mapStateToProps)(Root);
