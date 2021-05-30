import React, { FC, ReactElement, useState } from 'react';

import './tree-list.scss';

export type TreeListItem = {
  id: string;
  name: string;
  children?: TreeListItem[];
  data?: Record<string, string | number>,
};

type Props = {
  items: TreeListItem[];
  className?: string;
  classNameOnClickable?: string;
  wrapComponent?: (item: TreeListItem, toggle: () => void) => ReactElement;
};


const TreeList: FC<Props> = ({
  items = [],
  className = '',
  classNameOnClickable = '',
  wrapComponent = undefined,
}) => (
  <ul
    className={ `tree-list ${className}` }
    data-component="structure/interacting/tree-list"
  >
    { items.map((item) => {
      const [isOpen, setIsOpen] = useState(false);
      const hasChildren = !!item.children && item.children.length > 0;

      const toggle = () => hasChildren && setIsOpen(!isOpen);

      return (<li key={ item.id } className={`tree-list__item ${ hasChildren ? 'tree-list__item--has-children' : '' } ${ isOpen ? 'tree-list__item--is-open' : '' }`}>
        { hasChildren && (<span
          className={`tree-list__item-fold-indicator ${isOpen ? 'tree-list__item-fold-indicator--is-open' : ''}`}
          onClick={ toggle }
        ></span>)}
        <span
          className={ `tree-list__item-name ${ hasChildren ? ['tree-list__item-name--is-clickable', classNameOnClickable].join(' ') : '' }` }
          onClick={ () => !wrapComponent && toggle() }
        >
          { wrapComponent ? wrapComponent(item, toggle): item.name }
        </span>
        { isOpen && hasChildren && <TreeList items={ item.children || [] } wrapComponent={ wrapComponent } classNameOnClickable={classNameOnClickable}></TreeList> }
      </li>);
    }) }
  </ul>
);

export default TreeList;
