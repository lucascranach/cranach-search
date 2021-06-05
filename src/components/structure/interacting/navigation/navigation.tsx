import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import Logo from '../../../base/visualizing/logo';
import CategoryFilter from '../../../base/interacting/category-filter';
// import Switcher from '~/components/atoms/switcher';

import translations from './translations.json';
import './navigation.scss';

import StoreContext, { GlobalSearchEntityType } from '../../../../store/StoreContext';

type Translations = {
  de: Record<string, string>
};

const Navigation = () => {
  const useTranslation = (_: string, translations: Translations) => ( { t: (key: string, _?: Record<string, string>) => translations.de[key] } );
  const { t } = useTranslation('Navigation', translations);
  const { globalSearch, ui } = useContext(StoreContext);
  const isActive = (activeFilter?: GlobalSearchEntityType, filterValue?: GlobalSearchEntityType) => {
    return activeFilter === filterValue ? 'is-active' : ''
  }

  const navStructure = [
    {
      title: 'All Departments',
      filterValue: GlobalSearchEntityType.UNKNOWN,
    },
    {
      title: 'Prints and Drawings',
      filterValue: GlobalSearchEntityType.GRAPHICS,
    },
    {
      title: 'Paintings',
      filterValue: GlobalSearchEntityType.PAINTINGS,
    },
    {
      title: 'Archival Documents',
      filterValue: GlobalSearchEntityType.DOCUMENTS,
    }
  ];

  const triggerAction = (filterValue: GlobalSearchEntityType) => {
    globalSearch?.setEntityType(filterValue);
  }

  const toggleSidebar = () => {
    ui?.toggleSidebar();
  }

  const isVisibleMyCranach = ui?.sidebar === 'filter' ? 'btn--is-visible' : 'btn--is-hidden';
  const isVisibleFilter = ui?.sidebar === 'myCranach' ? 'btn--is-visible' : 'btn--is-hidden';

  return (
    <nav
      className="main-navigation"
      role="navigation"
      aria-label="main navigation"
      data-component="structure/interacting/navigation"
    >
      <Logo />
      <ul className="menu">
        <li><i className="material-icons" /></li>
        {
          navStructure.map(item => (
            <li className="menu__item"
              key={item.filterValue}
            >
              <CategoryFilter
                className={isActive(globalSearch?.filters.entityType, item.filterValue)}
                filterText={t(item.title)}
                onClick={() => triggerAction(item.filterValue) }
              >
              </CategoryFilter>
            </li>
          ))
        }
      </ul>

      <ul className="sidebar-menu">
        <li>
        <button
            className={`btn btn--is-reduced ${isVisibleMyCranach}`}
            onClick={()=> toggleSidebar()}
          >
            <i className="icon icon--is-inline">list</i>
            { t('goto My Cranach') }
          </button>
          <button
            className={`btn btn--is-reduced ${isVisibleFilter}`}
            onClick={()=> toggleSidebar()}
          >
            <i className="icon icon--is-inline">manage_search</i>
            { t('goto search') }
          </button>
        </li>
      </ul>

    </nav>
  );
};

export default observer(Navigation);
