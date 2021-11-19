import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';

import ArtefactOverview, { ArtefactOverviewType } from '../../../structure/visualizing/artefact-overview';

import translations from './translations.json';
import './secondary-navigation.scss';


import StoreContext, { UIOverviewViewType, UISidebarType } from '../../../../store/StoreContext';


const SecondaryNavigation = () => {
  const { root: { ui, collection, globalSearch } } = useContext(StoreContext);
  const { t } = ui.useTranslation('Navigation', translations);

  const [isActive, setActive] = useState(false);
  const toggleSecondaryMenu = () => {
    setActive(!isActive);
  };
  const secondaryMenuStatus = isActive ? "is-active" : "";

  const showMyCranach = () => {
    ui.setSideBarContent(UISidebarType.MY_CRANACH);
    collection.showCollection();
  }

  const showFilter = () => {
    ui.setSideBarContent(UISidebarType.FILTER);
    globalSearch.triggerFilterRequest();
  }

  /* Building a map for mapping UIOverviewViewType enum values to matching ArtefactOverviewType enum values */
  const overviewViewTypeMap: Record<UIOverviewViewType, ArtefactOverviewType> = {
    [UIOverviewViewType.CARD]: ArtefactOverviewType.CARD,
    [UIOverviewViewType.CARD_SMALL]: ArtefactOverviewType.CARD_SMALL,
    [UIOverviewViewType.LIST]: ArtefactOverviewType.LIST,
  };

  /* We also need a map to map back from ArtefactOverview enum values to UIOverviewViewType enum values */
  const reverseOverviewViewTypeMap: Record<ArtefactOverviewType, UIOverviewViewType> = {
    [ArtefactOverviewType.CARD]: UIOverviewViewType.CARD,
    [ArtefactOverviewType.CARD_SMALL]: UIOverviewViewType.CARD_SMALL,
    [ArtefactOverviewType.LIST]: UIOverviewViewType.LIST,
  }

  return (
    <div
      className={`secondary-navigation ${secondaryMenuStatus}`}
      role="navigation"
      aria-label="secondary navigation"
      data-component="structure/interacting/secondary-navigation"
    >
      <button
        className={`btn btn--is-stacked btn--is-reduced secondary-navigation__trigger`}
        onClick={() => toggleSecondaryMenu()}
      >
        <i className="icon icon--is-inline">more_vert</i>
      </button>

      <ul className="secondary-navigation__options">

        <li>
          <ArtefactOverview.Switcher
            viewType={overviewViewTypeMap[ui.overviewViewType]}
            className="overview-switcher"
            handleChange={(type) => ui.setOverviewViewType(reverseOverviewViewTypeMap[type])}
          ></ArtefactOverview.Switcher>
        </li>

        <li>
          <button
            className={`btn btn--is-reduced`}
            onClick={() => showFilter()}
          >
            <i className="icon icon--is-inline">manage_search</i>
            {t('goto search')}
          </button>
        </li>

        <li>
          <button
            className={`btn btn--is-reduced`}
            onClick={() => showMyCranach()}
          >
            <i className="icon icon--is-inline">list</i>
            {t('goto My Collection')}
          </button>
        </li>


      </ul>
    </div>
  );
};

export default observer(SecondaryNavigation);
