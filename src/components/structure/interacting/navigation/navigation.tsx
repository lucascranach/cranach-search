import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import Logo from '../../../base/visualizing/logo';
import CategoryFilter from '../../../base/interacting/category-filter';
// import Switcher from '~/components/atoms/switcher';

import translations from './translations.json';
import './navigation.scss';

import StoreContext from '../../../../store/StoreContext';

type Translations = {
  de: Record<string, string>
};

const Navigation = () => {
  const useTranslation = (_: string, translations: Translations) => ( { t: (key: string, _?: Record<string, string>) => translations.de[key] } );
  const { t } = useTranslation('Navigation', translations);
  const { globalSearch } = useContext(StoreContext);
  const isActive = (activeFilter:string, filterValue:string) => { return activeFilter === filterValue ? 'is-active' : '' }

  const navStructure = [
    {
      title: 'Prints and Drawings',
      filterValue: 'GRAPHICS',
    },
    {
      title: 'Paintings',
      filterValue: 'PAINTINGS',
    },
    {
      title: 'Archival Documents',
      filterValue: 'DOCUMENTS',
    }
  ];

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
            <li className="menu-item"
              key={item.filterValue}
            >
              <CategoryFilter
                className={isActive(globalSearch?.getEntityType, item.filterValue)}
                filterText={t(item.title)}
                filterValue={item.filterValue}
                onClick={(filterValue) => globalSearch?.setEntityType(filterValue) }
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
