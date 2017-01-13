import React from 'react';
import { connect } from 'react-redux';
import List from '../chrome/list';
import './list.css';

const itemRenderer = (storeId) => (data, index) => (
  <b>{JSON.stringify(data)}</b>
);

const StoreList = ({ params: { storeId }, items }) => (
  <List data={items} itemRenderer={itemRenderer(storeId)}/>
);

const mapStateToProps = ({ store: { items } }) => ({ items });

export default connect(mapStateToProps)(StoreList);