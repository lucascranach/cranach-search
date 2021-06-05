import React , { FC } from 'react';

import './size.scss';

type Props = {
  size?: number
}

const Size: FC<Props> = ({
  size
}) => (
  <span
    className="size"
    data-component="base/visualizing/size"
  >
    {size}
  </span>
);

export default Size;
