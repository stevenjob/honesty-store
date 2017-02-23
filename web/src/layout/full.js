import React from 'react';

export default ({
  top,
  children,
}) =>
  <div className="py2 navy sm-col-10 md-col-8 lg-col-6 mx-auto">
    {top}
    <div className="px2 center">
      {children}
    </div>
  </div>;
