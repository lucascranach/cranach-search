import React, { FC, useContext, useEffect } from 'react';

import { observer } from 'mobx-react-lite';

import ArtefactOverview from '../../structure/visualizing/artefact-overview';
import SearchSidebar from '../../structure/interacting/search-sidebar';
import SearchResultNavigation from '../../structure/interacting/search-result-navigation';

import StoreContext from '../../../store/StoreContext';

import './search.scss';

const Search: FC = () => {
  const { globalSearch } = useContext(StoreContext);

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
      <div className="search__sidebar">
        <SearchSidebar />
      </div>
    </div>
  );
};

export default observer(Search);
