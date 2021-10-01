import React, { FC, useContext, useEffect } from 'react';

import { observer } from 'mobx-react-lite';

import ArtefactOverview, { ArtefactOverviewItem, ArtefactOverviewType } from '../../structure/visualizing/artefact-overview';
import SearchSidebar from '../../structure/interacting/search-sidebar';
import SearchResultNavigation from '../../structure/interacting/search-result-navigation';
import MyCranach from '../../structure/interacting/my-cranach';
import StoreContext, { UISidebarType, GlobalSearchEntityType, UIOverviewViewType } from '../../../store/StoreContext';

import './search.scss';

const Search: FC = () => {
  const { globalSearch, ui } = useContext(StoreContext);
  const isActiveSidebar = 'search__sidebar--is-active';
  const isActiveFilter = ui.sidebar === UISidebarType.FILTER ? 'search__filter--is-active' : '';
  const isActiveMyCranach = ui.sidebar === UISidebarType.MY_CRANACH ? 'search__my-cranach--is-active' : '';

  useEffect(() => {
    globalSearch.triggerFilterRequest();
  }, [])

  const getToUrlForArtifact = (entityType: GlobalSearchEntityType, id: string): string => {
    const paintingsBaseUrl = import.meta.env.VITE_CDA_PAINTINGS_BASE_URL;
    const graphicsBaseUrl = import.meta.env.VITE_CDA_GRAPHICS_BASE_URL;
    const cdaBaseUrl = import.meta.env.VITE_CDA_BASE_URL;

    switch (entityType) {
      case GlobalSearchEntityType.GRAPHICS:
        return `${graphicsBaseUrl}/${ui.lang}/${id}?back=${window.encodeURIComponent(window.location.href)}`;

      case GlobalSearchEntityType.PAINTINGS:
        return `${paintingsBaseUrl}/${ui.lang}/${id}`;

      case GlobalSearchEntityType.DOCUMENTS:
        return `${cdaBaseUrl}/archival-documents/${id}`;

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

  const mapSelectedOverviewViewType = (type: UIOverviewViewType): ArtefactOverviewType => ({
    [UIOverviewViewType.CARD]: ArtefactOverviewType.CARD,
    [UIOverviewViewType.CARD_SMALL]: ArtefactOverviewType.CARD_SMALL,
    [UIOverviewViewType.LIST]: ArtefactOverviewType.LIST,
  })[type];

  return (
    <div
      className="search"
      data-component="page/search"
    >
      <div className="search__results-area">
        <SearchResultNavigation></SearchResultNavigation>
        {globalSearch.loading && 'Loading...'}
        {!globalSearch.loading
          && <ArtefactOverview
            viewType={mapSelectedOverviewViewType(ui.overviewViewType)}
            items={overviewItems}
          />
        }
      </div>

      <aside className={`search__sidebar ${isActiveSidebar}`}>
      <div className={`search__filter ${isActiveFilter}`}>
        <SearchSidebar />
      </div>

      <div className={`search__my-cranach ${isActiveMyCranach}`}>
        <MyCranach />
      </div>
      </aside>

    </div>
  );
};

export default observer(Search);
