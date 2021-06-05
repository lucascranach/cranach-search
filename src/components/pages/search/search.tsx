import React, { FC, useContext, useEffect } from 'react';

import { observer } from 'mobx-react-lite';

import ArtefactOverview from '../../structure/visualizing/artefact-overview';
import SearchSidebar from '../../structure/interacting/search-sidebar';
import SearchResultNavigation from '../../structure/interacting/search-result-navigation';
import MyCranach from '../../structure/interacting/my-cranach';

import StoreContext from '../../../store/StoreContext';

import './search.scss';

const Search: FC = () => {
  const { globalSearch, ui } = useContext(StoreContext);
  const isActiveFilter = ui?.sidebar === 'filter' ? 'search__filter--is-active' : '';
  const isActiveMyCranach = ui?.sidebar === 'myCranach' ? 'search__my-cranach--is-active' : '';

  useEffect(() => {
    globalSearch?.triggerFilterRequest();
  }, [])

  return (
    <div
      className="search"
      data-component="page/search"
    >
      <div className="search__results-area">
        <SearchResultNavigation></SearchResultNavigation>
      { globalSearch?.loading && 'Loading...' }
      { !globalSearch?.loading
        && <ArtefactOverview
          items={ globalSearch?.flattenedSearchResultItems }
        />
      }
      </div>
      <div className={`search__filter ${isActiveFilter}`}>
        <SearchSidebar />
      </div>
      <div className={`search__my-cranach ${isActiveMyCranach}`}>
        <MyCranach />
      </div>
    </div>
  );
};

export default observer(Search);
