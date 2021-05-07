import React, { useState, useContext } from 'react';

import { observer } from 'mobx-react-lite';

import Logo from '../../../base/visualizing/logo';
import Link from '../../../base/interacting/link';
// import Switcher from '~/components/atoms/switcher';

import translations from './translations.json';
import './navigation.scss';

// import StoreContext from '../../../../store/StoreContext';

type Translations = { de: Record<string, string> };

const Navigation = () => {
  const useTranslation = (_: string, translations: Translations) => ( { t: (key: string, _?: Record<string, string>) => translations.de[key] } );

  const { t } = useTranslation('Navigation', translations);

  const navStructure = [
    {
      title: 'Prints and Drawings',
      to: '/',
    },
    {
      title: 'Paintings',
      to: 'http://lucascranach.org/gallery',
    },
    {
      title: 'Archival Documents',
      to: 'http://lucascranach.org/archival-documents',
    },
    {
      title: 'Literature',
      to: 'http://lucascranach.org/publications',
    },
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
              key={item.to}
            ><Link
            to={item.to}
            activeClassName="is-active"
            partiallyActive={true}
          >
            {t(item.title)}
          </Link>

            </li>
          ))
        }
      </ul>

    </nav>
  );
};

export default observer(Navigation);
