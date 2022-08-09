import React , { FC } from 'react';

import './scroll-to.scss';

type Props = {
  className?: string,
  hideIf?: boolean,
  element?: HTMLElement,
}

const scrollTo: FC<Props> = ({
  className,
  hideIf,
  element,
}) => {
  const click = () => {
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ behavior: 'smooth', top: 0 });
    }
  }

  return (
    <div
      className={ `scroll-to ${className} ${(hideIf === true) ? 'scroll-to--hidden': ''}` }
      data-component="base/interacting/scrollTo"
      onClick={ click }
    >
      <i className="icon">arrow_drop_up</i>
    </div>
  )
};

export default scrollTo;
