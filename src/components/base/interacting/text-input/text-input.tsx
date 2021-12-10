import React, { FC, KeyboardEvent } from 'react';

import './text-input.scss';

type Props = {
  label?: string,
  className?: string,
  value?: string,
  placeholder?: string,
  onChange?: (value: string) => void
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void,
};

const TextInput: FC<Props> = ({
  label = '',
  className = '',
  value = '',
  placeholder = '',
  onChange = () => {},
  onKeyDown = () => {},
}) => (
  <label
    className={ `text-input ${className}` }
    data-component="base/interacting/text-input"
  >
    <input
      type="text"
      className="input-field"
      value={ value }
      placeholder={ placeholder }
      onChange={ (e) => { onChange(e.target.value); } }
      onKeyDown={ onKeyDown }
    />
    { label
      && <span className="label-text">{ label }</span>
    }
  </label>
);

export default TextInput;
