import React , { FC } from 'react';

import './size.scss';

type Props = {
  size?: string | number | undefined
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
