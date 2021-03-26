import React , { FC } from 'react';

import './btn.scss';

type Props = {
  className?: string,
  click?: () => void,
}

const btn: FC<Props> = ({
  className,
  children,
  click = () => {},
}) => (
  <button
    className={ `btn ${className}` }
    data-component="base/interacting/btn"
    onClick={ click }
  >
    { children }
  </button>
);

export default btn;
