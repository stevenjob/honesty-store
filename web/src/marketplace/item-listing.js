import React from 'react';
import safeLookupItemImage from '../item/safeLookupItemImage';

export default ({ item: { image, name, qualifier, purchaseCount, refundCount, listCount, count: availableCount } }) => {
  const soldCount = purchaseCount - refundCount;
  const soldStockPercentage = soldCount / listCount * 100;
  const unaccountedStockPercentage = (listCount - availableCount - soldCount) / listCount * 100;

  return (
    <div className="flex p2">
      <div className="col-3">
        <div
          className="bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${safeLookupItemImage(image)})`,
            paddingBottom: '100%'
          }}
        >
          {'\u00a0'}
        </div>
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
            <h4 className="navy regular my0"><span className="h3 bold">{purchaseCount - refundCount}</span>/{listCount}</h4>
            <p className="my0 gray">sold</p>
          </div>
        </div>
        <div className="bg-silver border border-gray flex rounded mt2" style={{ height: '0.5rem' }}>
          <div className="inline-block col-2 bg-aqua" style={{ width: `${soldStockPercentage}%` }}></div>
          <div className="inline-block col-2 bg-yellow" style={{ width: `${unaccountedStockPercentage}%` }}></div>
        </div>
      </div>
    </div>
  );
};
