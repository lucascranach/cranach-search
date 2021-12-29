import React, { FC, useContext } from 'react';
import { observer } from 'mobx-react-lite';

import './search-result-navigation.scss';

import StoreContext from '../../../../store/StoreContext';

type Props = {
  range?: number,
};

const SearchResultNavigation: FC<Props> = ({
  range = 6,
}) => {
  const paginationClass = 'pagination__item';
  const clickableClass = `${paginationClass}--clickable`;
  const activeClass = `${paginationClass}--active`;
  const firstItemClass = `${paginationClass}--first-item`;
  const lastItemClass = `${paginationClass}--last-item`;
  const hiddenClass = `${paginationClass}--hidden`;

  const { root: { globalSearch } } = useContext(StoreContext);
  const {
    currentResultPagePos,
    maxResultPages,
  } = globalSearch;

  const firstIsActive = currentResultPagePos > 0;
  const lastIsActive = currentResultPagePos < maxResultPages - 1;

  const arrayToClassName = (classes: string[]): string => classes.join(' ');

  const getPaginationNavItemClassName = (pos: number, currentResultPagePos: number): string => {
    if (pos === currentResultPagePos) {
      const classes = [paginationClass, clickableClass, activeClass];

      if (pos === 0) classes.push(firstItemClass);
      if (pos === maxResultPages) classes.push(lastItemClass);

      return arrayToClassName(classes);
    }

    if (pos === 0) {
      return arrayToClassName([paginationClass, clickableClass, firstItemClass]);
    }

    if (pos === maxResultPages - 1) {
      return arrayToClassName([paginationClass, clickableClass, lastItemClass]);
    }

    const addRight = currentResultPagePos <= range ? (range - currentResultPagePos) : 0;
    if (pos > currentResultPagePos - range && pos < (currentResultPagePos + range + addRight)) {
      return arrayToClassName([paginationClass, clickableClass]);
    }

    return arrayToClassName([paginationClass, hiddenClass]);
  }

  const navItems = Array(maxResultPages).fill(0).map((_, idx) => ({
    pos: idx,
    text: idx + 1,
    className: getPaginationNavItemClassName(idx, currentResultPagePos),
  }));

  return (
    <div className="pagination-wrap">
      {maxResultPages > 1 &&
        <ul className="pagination">
          <li
            className={firstIsActive
              ? arrayToClassName([paginationClass, firstItemClass, clickableClass])
              : arrayToClassName([paginationClass, firstItemClass])
            }
            onClick={() => { firstIsActive && globalSearch.setPagination(-1); }}
          >&lt;</li>
          <li
            className={lastIsActive
              ? arrayToClassName([paginationClass, lastItemClass, clickableClass])
              : arrayToClassName([paginationClass, lastItemClass])
            }
            onClick={() => { lastIsActive && globalSearch.setPagination(1); }}
          >&gt;</li>
        </ul>
      }
      {maxResultPages > 1 &&
        <ul className="pagination">
          {navItems.map(navItem => (
            <li
              className={navItem.className}
              key={navItem.pos}
              onClick={() => { globalSearch.jumpToPagePos(navItem.pos) }}
            >{navItem.text}</li>))
          }

        </ul>
      }
    </div>
  );
};

export default observer(SearchResultNavigation);
