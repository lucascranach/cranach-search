import React, { FC, KeyboardEvent, useRef } from 'react';

import './text-input.scss';

type Props = {
  label?: string,
  className?: string,
  value?: string,
  placeholder?: string,
  onChange?: (value: string) => void,
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void,
  disabled?: boolean,
  resetable?: boolean,
  onReset?: () => void,
};

const TextInput: FC<Props> = ({
  label = '',
  className = '',
  value = '',
  placeholder = '',
  onChange = () => {},
  onKeyDown = () => {},
  disabled = false,
  resetable = false,
  onReset = () => {},
}) => {
  const inputFieldEl = useRef<HTMLInputElement|null>(null);

  return (<label
      className={ `text-input ${className} ${resetable ? '-is-resetable' : ''}` }
      data-component="base/interacting/text-input"
    >
      <span className="text-input-group">
        <input
          ref={inputFieldEl}
          type="text"
          className="input-field"
          value={ value }
          placeholder={ placeholder }
          onChange={ (e) => { onChange(e.target.value); } }
          onKeyDown={ onKeyDown }
          disabled={ disabled }
        />
        { !disabled && resetable && (<span
            className="reset-icon icon"
            onClick={ () => {
              onChange('');
              onReset();
            } }
          >backspace</span>) }
      </span>
      { label
        && <span className="label-text">{ label }</span>
      }
    </label>
  );
}

export default TextInput;
