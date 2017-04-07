import React from 'react';

export default ({
  left,
  right,
  children,
}) =>
  <div className="py2 navy sm-col-10 md-col-8 lg-col-6 mx-auto bh-">
    <div className="flex justify-between items-center">
      {left}
      <div className="mr2">
        {right}
      </div>
    </div>
    <div className="px2 center">
      {children}
    </div>
  </div>;
