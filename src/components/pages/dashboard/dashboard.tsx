import React, { FC, useContext, useEffect } from 'react';

import { observer } from 'mobx-react-lite';

import ArtefactOverview, { ArtefactOverviewItem, ArtefactOverviewType } from '../../structure/visualizing/artefact-overview';
import Cloak from '../../base/visualizing/cloak';
import SearchResultNavigation from '../../structure/interacting/search-result-navigation';
import Navigation from '../../structure/interacting/navigation';
import StoreContext, { GlobalSearchEntityType, UIOverviewViewType } from '../../../store/StoreContext';

import './dashboard.scss';

const Dashboard: FC = () => {
  const { root: { globalSearch, ui } } = useContext(StoreContext);

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
        return `${paintingsBaseUrl}/${ui.lang}/paintings/${id}`;

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
      openInNewWindow: false,
    }),
  );

  const mapSelectedOverviewViewType = (type: UIOverviewViewType): ArtefactOverviewType => ({
    [UIOverviewViewType.CARD]: ArtefactOverviewType.CARD,
    [UIOverviewViewType.CARD_SMALL]: ArtefactOverviewType.CARD_SMALL,
    [UIOverviewViewType.LIST]: ArtefactOverviewType.LIST,
  })[type];

  return (
    <div
      className="dashboard"
      data-component="page/search"
    >
      <main className="main-content">
        <Navigation></Navigation>
        {globalSearch.loading && <Cloak />}
        <ArtefactOverview
          viewType={mapSelectedOverviewViewType(ui.overviewViewType)}
          items={overviewItems}
          handleArtefactAmountChange={ (amount: number) => globalSearch.setSize(amount) }
        />
      </main>
      <SearchResultNavigation></SearchResultNavigation>
    </div>
  );
};

export default observer(Dashboard);
