import React , { FC } from 'react';

import './checkbox.scss';

type Props = {
  className?: string,
  name?: string,
  value?: string,
  checked?: boolean,
  onChange?: (val: boolean) => void,
};

const Checkbox: FC<Props> = ({
  className = '',
  name = '',
  value = '',
  checked = false,
  onChange = (_: boolean) => {},
  children,
}) => (
  <label>
    <input
      className={ `checkbox ${className}` }
      data-component="base/interacting/checkbox"
      type="checkbox"
      name={ name }
      value={ value }
      checked={ checked }
      onChange={ (evt) => onChange(evt.target.checked) }
    />
    { children }
  </label>
);

export default Checkbox;
