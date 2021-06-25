import React , { FC } from 'react';
import { observer } from 'mobx-react-lite';

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
  <label
    className={ `checkbox ${className}` }
    data-component="base/interacting/checkbox"
  >
    <input
      type="checkbox"
      name={ name }
      value={ value }
      checked={ checked }
      onChange={ (evt) => onChange(evt.target.checked) }
    />
    <span className="checkbox__control"></span>
    { children }
  </label>
);

export default observer(Checkbox);
