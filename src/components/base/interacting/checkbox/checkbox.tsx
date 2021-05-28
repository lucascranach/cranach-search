import React , { FC } from 'react';

import './checkbox.scss';

type Props = {
  className?: string,
  value?: string,
  checked?: boolean,
  onChange?: (val: boolean) => void,
};

const Checkbox: FC<Props> = ({
  className = '',
  value = '',
  checked = false,
  onChange = (_: boolean) => {},
}) => (
  <input
    className={ `checkbox ${className}` }
    data-component="base/interacting/checkbox"
    type="checkbox"
    value={ value }
    checked={ checked }
    onChange={ (evt) => onChange(evt.target.checked) }
  />
);

export default Checkbox;
