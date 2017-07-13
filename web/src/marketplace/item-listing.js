import React from 'react';
import safeLookupItemImage from '../item/safeLookupItemImage';
import Currency from '../format/Currency';

const ListingBreakdown = ({ items, itemRenderer }) => (
  <ul className="gray list-reset my0">
    {items.map((item, index, arr) => itemRenderer(item, index, arr.length))}
  </ul>
);

export default ({
  item: {
    image,
    name,
    qualifier,
    purchaseCount,
    refundCount,
    listCount,
    count: availableCount,
    revenue
  }
}) => {
  const soldCount = purchaseCount - refundCount;
  const unknownCount = listCount - availableCount - soldCount;
  const leftCount = listCount - unknownCount - soldCount;
  const items = [
    {
      title: 'left',
      count: leftCount,
      color: 'navy'
    },
    {
      title: 'unknown',
      count: unknownCount,
      color: 'aqua'
    },
    {
      title: 'sold',
      count: soldCount,
      color: 'gray'
    }
  ].filter(({ count }) => count > 0);
  return (
    <div className="flex p2">
      <div className="col-3">
        <div
          className="bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${safeLookupItemImage(image)})`,
            paddingBottom: '100%'
          }}
        />
      </div>
      <div className="ml2 flex flex-column flex-auto justify-center">
        <div className="flex justify-between">
          <div className="flex flex-column justify-center">
            <h3 className="navy mt0 mb0 regular">
              {name}
            </h3>
            {qualifier &&
              <p className="mt0 mb0 gray">
                {qualifier}
              </p>}
          </div>
          <div className="flex flex-column justify-center items-end">
            <h3 className="navy regular my0"><Currency amount={revenue} /></h3>
            <p className="my0 gray">revenue</p>
          </div>
        </div>
        <div
          className="bg-gray flex rounded my2"
          style={{
            height: '0.5rem',
            backgroundColor: '#e6e6e6',
            overflow: 'hidden'
          }}
        >
          <div
            className="inline-block col-2 bg-navy"
            style={{
              width: `${(listCount - unknownCount - soldCount) / listCount * 100}%`
            }}
          />
          <div
            className="inline-block col-2 bg-aqua"
            style={{ width: `${unknownCount / listCount * 100}%` }}
          />
        </div>
        <ListingBreakdown
          items={items}
          itemRenderer={({ title, count, color }, index, length) => (
            <li key={title} className="inline-block">
              <span className={color}>
                {count}
                {'\u00a0'}
                {title}
              </span>
              {index < length - 1 && <span>{'\u00a0'}/{'\u00a0'}</span>}
            </li>
          )}
        />
      </div>
    </div>
  );
};
