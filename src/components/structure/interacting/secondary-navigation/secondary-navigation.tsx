import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import ArtefactOverview, { ArtefactOverviewType } from '../../../structure/visualizing/artefact-overview';
import Switcher from '../../../base/interacting/switcher';

import translations from './translations.json';
import './secondary-navigation.scss';


import StoreContext, { UIArtifactKind, UIOverviewViewType, UISidebarContentType, UISidebarStatusType } from '../../../../store/StoreContext';


const SecondaryNavigation = () => {
  const { root: { ui, collection, lighttable } } = useContext(StoreContext);
  const { t } = ui.useTranslation('Navigation', translations);

  const toggleSecondaryMenu = () => {
    const targetIsVisible = !ui.secondaryNavigationIsVisible;

    if (targetIsVisible) {
      ui.setSideBarStatus(UISidebarStatusType.MAXIMIZED);
    }

    ui.setSecondaryNavigationIsVisible(targetIsVisible);
  };
  const secondaryMenuStatus = ui.secondaryNavigationIsVisible ? "is-active" : "";

  const showMyCranach = () => {
    ui.setSideBarContent(UISidebarContentType.MY_CRANACH);
  }

  const showFilter = () => {
    ui.setSideBarContent(UISidebarContentType.FILTER);
  }

  const hideSidebar = () => {
    ui.setSideBarStatus(UISidebarStatusType.MINIMIZED);
    toggleSecondaryMenu();
  }

  /* Building a map for mapping UIOverviewViewType enum values to matching ArtefactOverviewType enum values */
  const overviewViewTypeMap: Record<UIOverviewViewType, ArtefactOverviewType> = {
    [UIOverviewViewType.CARD]: ArtefactOverviewType.CARD,
    [UIOverviewViewType.CARD_SMALL]: ArtefactOverviewType.CARD_SMALL,
    [UIOverviewViewType.LIST]: ArtefactOverviewType.LIST,
    [UIOverviewViewType.TABLE]: ArtefactOverviewType.TABLE,
  };

  /* We also need a map to map back from ArtefactOverview enum values to UIOverviewViewType enum values */
  const reverseOverviewViewTypeMap: Record<ArtefactOverviewType, UIOverviewViewType> = {
    [ArtefactOverviewType.CARD]: UIOverviewViewType.CARD,
    [ArtefactOverviewType.CARD_SMALL]: UIOverviewViewType.CARD_SMALL,
    [ArtefactOverviewType.LIST]: UIOverviewViewType.LIST,
    [ArtefactOverviewType.TABLE]: UIOverviewViewType.TABLE,
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

      </button>

      <ul className="secondary-navigation__options">

        <li className="switcher-row">
          <ArtefactOverview.Switcher
            viewType={overviewViewTypeMap[ui.overviewViewType]}
            className="overview-switcher"
            handleChange={(type) => ui.setOverviewViewType(reverseOverviewViewTypeMap[type]) }
            limitedToViews={ui.limitedToOverviews.map((currRestrictedOverview) => overviewViewTypeMap[currRestrictedOverview])}
          ></ArtefactOverview.Switcher>

          <Switcher className="lang-selector">
            {
              Object.entries(ui.allowedLangs).map(([langCode, langAbbreviation]) => (
                <Switcher.Item key={langCode}>
                  <span
                    className={`lang-selector__item ${langCode === ui.lang ? 'lang-selector__item--is-active' : ''}`}
                    onClick={() => ui.setLanguage(langCode)}
                  >{langAbbreviation}</span>
                </Switcher.Item>
              ))
            }
          </Switcher>
        </li>

        <li>
          <button
            className={`btn btn--is-reduced`}
            onClick={() => showFilter()}
          >
            <i className="icon icon--is-inline">manage_search</i>
            {t('Go to search')}
          </button>
        </li>

        <li>
          <button
            className={`btn btn--is-reduced`}
            onClick={() => showMyCranach()}
          >
            <i className="icon icon--is-inline">list</i>
            {t('Go to my Collection')}
          </button>
        </li>

        <li>
          <button
            className={`btn btn--is-reduced`}
            onClick={() => hideSidebar()}
          >
            <i className="icon icon--is-inline">minimize</i>
            {t('Hide sidebar')}
          </button>
        </li>


      </ul>
    </div>
  );
};

export default observer(SecondaryNavigation);
