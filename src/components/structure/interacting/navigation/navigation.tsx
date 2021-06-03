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
  const { globalSearch, collection } = useContext(StoreContext);
  const isActive = (activeFilter?: GlobalSearchEntityType, filterValue?: GlobalSearchEntityType) => {
    return activeFilter === filterValue ? 'is-active' : ''
  }

  const navStructure = [
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
    },
    {
      title: 'My Collection',
      filterValue: GlobalSearchEntityType.UNKNOWN,
    }
  ];

  const triggerAction = (filterValue: GlobalSearchEntityType) => {
    if (filterValue === GlobalSearchEntityType.UNKNOWN) {
      globalSearch?.setEntityType(filterValue);
      collection?.showCollection();
    } else {
      globalSearch?.setEntityType(filterValue);
    }
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
                className={isActive(globalSearch?.filters.entityType, item.filterValue)}
                filterText={t(item.title)}
                onClick={() => triggerAction(item.filterValue) }
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
