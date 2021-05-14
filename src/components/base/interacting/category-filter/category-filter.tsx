import React, { FC } from 'react';

type Props = {
  className?: string,
  filterText?: string,
  onClick?: () => void
};

const CategoryFilter: FC<Props> = ({
  className = '',
  filterText = '',
  onClick = () => { },
}) => (
  <a
    className={className}
    onClick={ onClick }
  >
    {filterText}
  </a>

);

export default CategoryFilter;
