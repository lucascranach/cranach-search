import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import Logo from '../../../base/visualizing/logo';
import CategoryFilter from '../../../base/interacting/category-filter';

import translations from './translations.json';
import './navigation.scss';

import StoreContext, { UIArtifactKind } from '../../../../store/StoreContext';


const Navigation = () => {
  const { root: { ui } } = useContext(StoreContext);

  const { t } = ui.useTranslation('Navigation', translations);

  const isActive = (activeFilter?: UIArtifactKind, filterValue?: UIArtifactKind) => { return activeFilter === filterValue ? 'is-active' : '' }

  const navStructure = [
    {
      title: 'All Objects',
      kind: UIArtifactKind.WORKS,
    },
    {
      title: 'Paintings',
      kind: UIArtifactKind.PAINTINGS,
    },
    {
      title: 'Drawings',
      kind: UIArtifactKind.DRAWINGS,
    },
    {
      title: 'Prints',
      kind: UIArtifactKind.GRAPHICS,
    },
    {
      title: 'Archival Documents',
      kind: UIArtifactKind.ARCHIVALS,
    },
    {
      title: 'Publications',
      kind: UIArtifactKind.LITERATURE_REFERENCES,
    },
    /*
    {
      title: 'Prints and Drawings',
      entityTypes: new Set([EntityType.GRAPHIC]),
    },
    */
  ];

  const triggerAction = (kind: UIArtifactKind) => {
    ui.jumpToArtifactKind(kind);
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
            <li className="menu__item" key={item.title}>
              { /* TODO: do not depend on searchWorks */ }
              <CategoryFilter
                className={isActive(ui.artifactKind, item.kind)}
                filterText={t(item.title)}
                onClick={() => triggerAction(item.kind)}
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
