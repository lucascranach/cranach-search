import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import translations from './translations.json';
import './search-result-navigation.scss';

import StoreContext, { GlobalSearchEntityType } from '../../../../store/StoreContext';

type Translations = {
  de: Record<string, string>
};

const range = 6;

const SearchResultNavigation: FC<Props> = ({
  hits = 0,
  size = 0,
  from = 0
}) => {
  const useTranslation = (_: string, translations: Translations) => ({ t: (key: string, _?: Record<string, string>) => translations.de[key] });
  const { t } = useTranslation('Navigation', translations);
  const { globalSearch } = useContext(StoreContext);
  const pages = Math.ceil(hits / size);

  const pos = () => (from / size) + 1;
  const firstIsActive = () => (pos() > 1) ? true : false;
  const lastIsActive = () => (pos() < pages) ? true : false;

  const getChunks = () => {
    const ret = [];
    const pages = Math.ceil(hits / size);
    for (var i = 1; i <= pages; i++) { ret.push(i); }
    return ret;
  }

  const getPaginationNavItemStatus = (item: number) => {

    const addfirst = item === 1 ? ' pagination__item--first-item' : '';
    const addLast = item === pages ? ' pagination__item--first-item' : '';

    if (item === pos()) {
      return 'pagination__item pagination__item--clickable pagination__item--active' + addfirst + addLast;
    }

    if (item === 1) {
      return 'pagination__item pagination__item--clickable pagination__item--first-item';
    }

    if (item === pages) {
      return 'pagination__item pagination__item--clickable pagination__item--last-item';
    }

    const addRight = pos() <= range ? range - pos() + 1 : 0;
    if (item > pos() - range && item < pos() + range + addRight) {
      return 'pagination__item pagination__item--clickable ';
    }

    return 'pagination__item pagination__item--hidden '
  }

  const setPagination = (direction: string) => {
    const newFrom = (direction === 'up') ? from = from + size : from = from - size;
    globalSearch?.setFrom(newFrom);
  }

  const setPaginationDirect = (page: number) => {
    globalSearch?.setFrom(page * size);
  }

  return (
    <div className="pagination-wrap">
      {pages > 1 &&
        <ul className="pagination">
          <li
            className={firstIsActive() ? 'pagination__item pagination__item--first-item pagination__item--clickable' : 'pagination__item pagination__item--first-item'}
            onClick={() => { firstIsActive() ? setPagination('down') : false; }}
          >&lt;</li>
          <li
            className={lastIsActive() ? 'pagination__item pagination__item--last-item pagination__item--clickable' : 'pagination__item pagination__item--last-item'}
            onClick={() => { lastIsActive() ? setPagination('up') : false; }}
          >&gt;</li>
        </ul>
      }
      {pages > 2 &&
        <ul className="pagination">
          {getChunks().map(item => (
            <li
              className={getPaginationNavItemStatus(item)}
              key={item}
              onClick={() => { setPaginationDirect(item - 1) }}
            >{item}</li>))
          }

        </ul>
      }
    </div>
  );
};

export default observer(SearchResultNavigation);
