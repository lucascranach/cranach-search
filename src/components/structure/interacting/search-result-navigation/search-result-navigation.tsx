import React, { FC, useContext } from 'react';
import { observer } from 'mobx-react-lite';

import './search-result-navigation.scss';

import StoreContext from '../../../../store/StoreContext';

type Props = {
  range?: number,
};

enum PaginationDirection {
  UP = 'UP',
  DOWN = 'DOWN',
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

  const { globalSearch } = useContext(StoreContext);
  const { size, from } = globalSearch?.filters ?? { size: 1, from: 1 };
  const hits = globalSearch?.result?.meta.hits ?? 0;

  const maxPages = Math.ceil(hits / size);
  const currentPos = (from / size);

  const firstIsActive = currentPos > 0;
  const lastIsActive = currentPos < maxPages - 1;

  const arrayToClassName = (classes: string[]): string => classes.join(' ');

  const getPaginationNavItemClassName = (pos: number, currentPos: number): string => {
    if (pos === currentPos) {
      const classes = [paginationClass, clickableClass, activeClass];

      if (pos === 0) classes.push(firstItemClass);
      if (pos === maxPages) classes.push(lastItemClass);

      return arrayToClassName(classes);
    }

    if (pos === 0) {
      return arrayToClassName([paginationClass, clickableClass, firstItemClass]);
    }

    if (pos === maxPages - 1) {
      return arrayToClassName([paginationClass, clickableClass, lastItemClass]);
    }

    const addRight = currentPos <= range ? (range - currentPos) : 0;
    if (pos > currentPos - range && pos < (currentPos + range + addRight)) {
      return arrayToClassName([paginationClass, clickableClass]);
    }

    return arrayToClassName([paginationClass, hiddenClass]);
  }

  const setPagination = (direction: PaginationDirection) => {
    const newFrom = (direction === PaginationDirection.UP) ? from + size : from - size;
    globalSearch?.setFrom(newFrom);
  }

  const jumpToPage = (page: number) => {
    globalSearch?.setFrom(page * size);
  }

  const navItems = Array(maxPages).fill(0).map((_, idx) => ({
    pos: idx,
    text: idx + 1,
    className: getPaginationNavItemClassName(idx, currentPos),
  }));

  return (
    <div className="pagination-wrap">
      {maxPages > 1 &&
        <ul className="pagination">
          <li
            className={firstIsActive
              ? arrayToClassName([paginationClass, firstItemClass, clickableClass])
              : arrayToClassName([paginationClass, firstItemClass])
            }
            onClick={() => { firstIsActive && setPagination(PaginationDirection.DOWN); }}
          >&lt;</li>
          <li
            className={lastIsActive
              ? arrayToClassName([paginationClass, lastItemClass, clickableClass])
              : arrayToClassName([paginationClass, lastItemClass])
            }
            onClick={() => { lastIsActive && setPagination(PaginationDirection.UP); }}
          >&gt;</li>
        </ul>
      }
      {maxPages > 2 &&
        <ul className="pagination">
          {navItems.map(navItem => (
            <li
              className={navItem.className}
              key={navItem.pos}
              onClick={() => { jumpToPage(navItem.pos) }}
            >{navItem.text}</li>))
          }

        </ul>
      }
    </div>
  );
};

export default observer(SearchResultNavigation);
