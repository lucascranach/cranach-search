import React , { FC } from 'react';

import './toggle.scss';

type Props = {
  className?: string,
  title?: string,
  isOpen?: boolean,
  onToggle?: (toggleTo: boolean) => void,
}

const toggle: FC<Props> = ({
  className = '',
  title = '',
  isOpen = false,
  onToggle = () => {},
  children = {},
}) => (<div className={ `toggle ${className} ${isOpen ? '-open' : ''}` }>
  <header className="head">
    <span className="entry-title">{ title }</span>
    <span
      className="toggle-control"
      onClick={ () => onToggle(!isOpen) }
    >
      <i className="icon">expand_more</i>
    </span>
  </header>
  <main className="content">
    <div className="box">
      { children }
    </div>
  </main>
</div>);

export default toggle;
