import React, { FC, useContext, useEffect, useRef } from 'react';

import { observer } from 'mobx-react-lite';

import ArtefactOverview, { ArtefactOverviewItem, ArtefactOverviewType } from '../../structure/visualizing/artefact-overview';
import Cloak from '../../base/visualizing/cloak';
import SearchResultNavigation from '../../structure/interacting/search-result-navigation';
import Navigation from '../../structure/interacting/navigation';
import StoreContext, { GlobalSearchEntityType, UIOverviewViewType } from '../../../store/StoreContext';

import './dashboard.scss';

const Dashboard: FC = () => {
  const { root: { globalSearch, ui } } = useContext(StoreContext);

  const mainContentEl = useRef<HTMLElement|null>(null);

  useEffect(() => {
    globalSearch.triggerFilterRequest(false);
  }, [])

  useEffect(() => {
    if (window.scrollY < window.innerHeight) return;
    window.scrollTo({ behavior: 'smooth', top: 0 });
  }, [globalSearch.flattenedSearchResultItems]);

  useEffect(() => {
    if (!mainContentEl.current || mainContentEl.current.scrollTop === 0) return;
    mainContentEl.current.scrollTo({ behavior: 'smooth', top: 0 });
  }, [mainContentEl, globalSearch.flattenedSearchResultItems]);

  const getToUrlForArtifact = (_: GlobalSearchEntityType, id: string): string => {
    const cdaBaseUrl = import.meta.env.VITE_CDA_BASE_URL;
    return `${cdaBaseUrl}/${ui.lang}/${id}/`;
  };

  const overviewItems: ArtefactOverviewItem[] = globalSearch.flattenedSearchResultItems.map(
    (item) => ({
      ...item,
      to: getToUrlForArtifact(item.entityType, item.id),
      openInNewWindow: false,
      imgSrc: item.imgSrc || (import.meta.env.BASE_URL + 'assets/no-image--trans.png'),
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
      <Navigation></Navigation>
      <main
        className={`main-content ${ globalSearch.loading ? 'main-content--non-scrollable' : '' }`}
        ref={mainContentEl}
      >
        <ArtefactOverview.Overview
          viewType={mapSelectedOverviewViewType(ui.overviewViewType)}
          items={overviewItems}
          handleArtefactAmountChange={ (amount: number) => globalSearch.setSize(amount) }
        />
        { globalSearch.loading && <Cloak /> }
      </main>
      <SearchResultNavigation></SearchResultNavigation>
    </div>
  );
};

export default observer(Dashboard);
