import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import Logo from '../../../base/visualizing/logo';
import CategoryFilter from '../../../base/interacting/category-filter';

import translations from './translations.json';
import './navigation.scss';

import StoreContext, { EntityType } from '../../../../store/StoreContext';


const Navigation = () => {
  const { root: { searchWorks, ui } } = useContext(StoreContext);

  const { t } = ui.useTranslation('Navigation', translations);

  const isActive = (activeFilter?: EntityType, filterValue?: EntityType) => { return activeFilter === filterValue ? 'is-active' : '' }

  const navStructure = [
    {
      title: 'All Objects',
      filterValue: EntityType.UNKNOWN,
    },
    {
      title: 'Paintings',
      filterValue: EntityType.PAINTINGS,
    },
    {
      title: 'Archival Documents',
      filterValue: EntityType.ARCHIVALS,
    },
    /*
    {
      title: 'Prints and Drawings',
      filterValue: EntityType.GRAPHICS,
    },
    */
  ];

  const triggerAction = (filterValue: EntityType) => {
    searchWorks.setEntityType(filterValue);
  }

  return (
    <nav
      className="main-navigation is-hidden-vp-small"
      role="navigation"
      aria-label="main navigation"
      data-component="structure/interacting/navigation"
    >
      <Logo />
      <ul className="menu">
        <li><i className="icon" /></li>
        {
          navStructure.map(item => (
            <li className="menu__item"
              key={item.filterValue}
            >
              { /* TODO: do not depend on searchWorks */ }
              <CategoryFilter
                className={isActive(searchWorks.filters.entityType, item.filterValue)}
                filterText={t(item.title)}
                onClick={() => triggerAction(item.filterValue)}
              >
              </CategoryFilter>
            </li>
          ))
        }
      </ul>

    </nav>
  );
};

export default observer(Navigation);
