import React, { FC, useContext, useEffect } from 'react';

import { observer } from 'mobx-react-lite';

import ArtefactOverview, { ArtefactOverviewItem } from '../../structure/visualizing/artefact-overview';
import SearchSidebar from '../../structure/interacting/search-sidebar';
import SearchResultNavigation from '../../structure/interacting/search-result-navigation';

import StoreContext, { GlobalSearchEntityType } from '../../../store/StoreContext';

import './search.scss';

const Search: FC = () => {
  const { globalSearch, ui } = useContext(StoreContext);

  useEffect(() => {
    globalSearch.triggerFilterRequest();
  }, [])

  const getToUrlForArtifact = (entityType: GlobalSearchEntityType, id: string): string => {
    const cdaBaseUrl = 'https://lucascranach.org';
    const graphicsBaseUrl = 'https://lucascranach.github.io/cranach-grafiken-gatsby';

    switch(entityType) {
      case GlobalSearchEntityType.GRAPHICS:
        return `${graphicsBaseUrl}/${ui.lang}/${id}?back=${window.encodeURIComponent(window.location.href)}`;
        break;
      case GlobalSearchEntityType.PAINTINGS:
        return `${cdaBaseUrl}/${id}`;
        break;
      case GlobalSearchEntityType.DOCUMENTS:
        return `${cdaBaseUrl}/archival-documents/${id}`;
        break;

      default:
        return `$/{ui.lang}/${id}`;
    }
  };

  const overviewItems: ArtefactOverviewItem[] = globalSearch.flattenedSearchResultItems.map(
    (item) => ({
      ...item,
      to: getToUrlForArtifact(item.entityType, item.id),
      openInNewWindow: true,
    }),
  );

  return (
    <div
      className="search"
      data-component="page/search"
    >
      <div className="search__results-area">
        <SearchResultNavigation></SearchResultNavigation>
      { globalSearch.loading && 'Loading...' }
      { !globalSearch.loading
        && <ArtefactOverview
          items={ overviewItems }
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
