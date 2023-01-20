import React, { FC, useContext, useEffect, useRef } from 'react';

import { observer } from 'mobx-react-lite';

import ArtefactOverview, { ArtefactOverviewItem, ArtefactOverviewType } from '../../structure/visualizing/artefact-overview';
import Cloak from '../../base/visualizing/cloak';
import SearchResultNavigation from '../../structure/interacting/search-result-navigation';
import Navigation from '../../structure/interacting/navigation';
import ScrollTo from '../../base/interacting/scroll-to';
import StoreContext, { UIOverviewViewType, EntityType } from '../../../store/StoreContext';

import './dashboard.scss';

const Dashboard: FC = () => {
  const { root: { lighttable, ui } } = useContext(StoreContext);

  const mainContentEl = useRef<HTMLElement|null>(null);

  useEffect(() => {
    lighttable.fetch();
  }, [])

  useEffect(() => {
    if (window.scrollY < window.innerHeight) return;
    window.scrollTo({ behavior: 'smooth', top: 0 });
  }, [lighttable.flattenedResultItem]);

  useEffect(() => {
    if (!mainContentEl.current || mainContentEl.current.scrollTop === 0) return;
    mainContentEl.current.scrollTo({ behavior: 'smooth', top: 0 });
  }, [mainContentEl, lighttable.flattenedResultItem]);

  const getToUrlForArtifact = (_: EntityType, id: string): string => {
    const cdaArtefactUrlPattern = import.meta.env.VITE_CDA_ARTEFACT_URL as string;
    return cdaArtefactUrlPattern.replace('{{lang}}', ui.lang).replace('{{id}}', id);
  };

  const overviewItems: ArtefactOverviewItem[] = lighttable.flattenedResultItem.map(
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
    [UIOverviewViewType.TABLE]: ArtefactOverviewType.TABLE,
  })[type];

  return (
    <div
      className="dashboard"
      data-component="page/search"
    >
      <Navigation></Navigation>
      <main
        className={`main-content ${ lighttable.loading ? 'main-content--non-scrollable' : '' }`}
        ref={mainContentEl}
      >
        <ArtefactOverview.Overview
          viewType={mapSelectedOverviewViewType(ui.overviewViewType)}
          items={overviewItems}
          handleArtefactNumberChange={ (amount: number) => {
            lighttable.setSize(amount);
            lighttable.fetch();
          } }
          resetArtefactNumber={ () => {
            lighttable.resetSize();
            lighttable.fetch();
          } }
        />
        { lighttable.loading && <Cloak /> }
      </main>
      <SearchResultNavigation></SearchResultNavigation>
      <ScrollTo className="scroll-up" hideIf={ !ui.leftInitialViewArea }></ScrollTo>
    </div>
  );
};

export default observer(Dashboard);
