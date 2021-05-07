import React, { FC } from 'react';

type Props = {
  url?: string,
  className?: string,
  linkText?: string,
  onClick?: () => void
};

const Link: FC<Props> = ({
  url = '',
  className = '',
  linkText = '',
  onClick = () => {},
}) => (
  <Link
    to={url}
    className={ `${className}` }
    data-component="base/interacting/link"
  >{ linkText }

  </Link>
);

export default Link;
