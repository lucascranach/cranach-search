import React from 'react';

import './cloak.scss';

export default () => (
  <div
    className="cloak"
    data-component="atoms/cloak"
  >
    <div className="cloak__throbber">
      {Array(4).fill(0).map((_, i) => (<div key={i}></div>))}
    </div>
  </div>
);
