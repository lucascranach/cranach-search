import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import Logo from '../../../base/visualizing/logo';
import CategoryFilter from '../../../base/interacting/category-filter';
import Switcher from '../../../base/interacting/switcher';

import translations from './translations.json';
import './navigation.scss';

import StoreContext, { GlobalSearchEntityType } from '../../../../store/StoreContext';


const Navigation = () => {
  const { root: { globalSearch, ui } } = useContext(StoreContext);

  const { t } = ui.useTranslation('Navigation', translations);

  const isActive = (activeFilter?: GlobalSearchEntityType, filterValue?: GlobalSearchEntityType) => { return activeFilter === filterValue ? 'is-active' : '' }

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
    }
  ];

  const triggerAction = (filterValue: GlobalSearchEntityType) => {
    globalSearch.setEntityType(filterValue);
  }

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
                className={isActive(globalSearch.filters.entityType, item.filterValue)}
                filterText={t(item.title)}
                onClick={() => triggerAction(item.filterValue)}
              >
              </CategoryFilter>
            </li>
          ))
        }
      </ul>

      <Switcher className="lang-selector">
        {
          Object.entries(ui.allowedLangs).map(([langCode, langAbbreviation]) => (
            <Switcher.Item key={langCode}>
              <span
                className={`lang-selector__item ${ langCode === ui.lang ? 'lang-selector__item--is-active' : '' }`}
                onClick={ () => ui.setLanguage(langCode) }
              >{langAbbreviation}</span>
            </Switcher.Item>
          ))
        }
      </Switcher>
    </nav>
  );
};

export default observer(Navigation);
