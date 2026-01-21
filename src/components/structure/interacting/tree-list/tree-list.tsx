import React, { FC, ReactElement, useState } from 'react';
import { observer } from 'mobx-react-lite';

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
  wrapComponent?: (treeListItem: TreeListItem, toggle: () => boolean) => ReactElement;
  isOpenIf?: (treeListItem: TreeListItem) => boolean;
  onToggle?: (treeListItem: TreeListItem, isOpen: boolean) => void;
};


const TreeList: FC<Props> = ({
  items = [],
  className = '',
  classNameOnClickable = '',
  wrapComponent = undefined,
  isOpenIf = undefined,
  onToggle = undefined,
}) => {
  const initialOpenState = items.reduce(
    (acc, item) => {
      acc[item.id] = !!isOpenIf && isOpenIf(item);
      return acc;
    },
    {} as Record<string, boolean>,
  );
  const [isOpen, setIsOpen] = useState(initialOpenState);

  return (<ul
    className={ `tree-list ${className}` }
    data-component="structure/interacting/tree-list"
  >
    { items.map((item) => {
  
      const itemIsOpen = isOpen[item.id];
      const hasChildren = !!item.children && item.children.length > 0;

      const toggle = () => {
        if (!hasChildren) return false;
        if (onToggle) onToggle(item, !itemIsOpen);
        setIsOpen({...isOpen, [item.id]: !itemIsOpen });
        return !itemIsOpen;
      };

      return (<li key={ item.id } className={`tree-list__item ${ hasChildren ? 'tree-list__item--has-children' : '' } ${ itemIsOpen ? 'tree-list__item--is-open' : '' }`}>
        <span
          className={ `tree-list__item-name ${ hasChildren ? ['tree-list__item-name--is-clickable', classNameOnClickable].join(' ') : '' }` }
          onClick={ () => !wrapComponent && toggle() }
        >
          { wrapComponent ? wrapComponent(item, toggle): item.name }
        </span>
        {hasChildren && (<span
          className={`icon tree-list__item-fold-indicator ${itemIsOpen ? 'tree-list__item-fold-indicator--is-open' : ''}`}
          onClick={ toggle }
        >
          expand_more
        </span>)}
        { itemIsOpen && hasChildren && <TreeList
          items={ item.children || [] }
          wrapComponent={ wrapComponent }
          classNameOnClickable={classNameOnClickable}
          isOpenIf={isOpenIf}
          onToggle={onToggle}
        ></TreeList> }
      </li>);
    }) }
  </ul>);
};

export default observer(TreeList);
