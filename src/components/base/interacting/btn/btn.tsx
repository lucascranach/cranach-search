import React , { FC } from 'react';

import './btn.scss';

type Props = {
  className?: string,
  icon?: string,
  click?: () => void,
}

const btn: FC<Props> = ({
  className,
  children,
  icon,
  click = () => { },
}) => {
  const withIconClass = icon ? 'btn--with-icon' : '';
  return (
    <button
      className={ `btn ${className} ${withIconClass}` }
      data-component="base/interacting/btn"
      onClick={ click }
    >
      {icon && <i className="icon icon--is-inline">{icon}</i>}
      { children }
    </button>
  )
};

export default btn;
