import React, { FC } from 'react';

type Props = {
  filterValue?: string,
  className?: string,
  filterText?: string,
  onClick?: (value: string) => void
};

const CategoryFilter: FC<Props> = ({
  filterValue = '',
  className = '',
  filterText = '',
  onClick = (value: string) => { },
}) => (
  <a
    className={className}
    onClick={ (e) => { onClick(filterValue); } }
  >
    {filterText}
  </a>

);

export default CategoryFilter;
