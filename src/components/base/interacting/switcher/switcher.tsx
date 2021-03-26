import React, { FC } from 'react';

import './switcher.scss';

type Props = {
  className?: string,
};

type ItemProps = {
  className?: string
}

const Switcher: FC<Props> & { Item: FC<ItemProps> } = ({
  children,
  className = '',
}) => (
  <ul
    className={ `switcher ${className}` }
    data-component="base/interacting/switcher"
  >
    { children }
  </ul>
);

Switcher.Item = ({
  children,
  className = '',
}) => (
  <li
    className={ `switcher-item ${className}` }
  >
    { children }
  </li>
);

export default Switcher;
