import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';


import translations from './translations.json';
import './my-cranach.scss';

import StoreContext from '../../../../store/StoreContext';

type Translations = {
  de: Record<string, string>
};

const MyCranach = () => {
  const useTranslation = (_: string, translations: Translations) => ({ t: (key: string, _?: Record<string, string>) => translations.de[key] });

  const { t } = useTranslation('SearchSidebar', translations);
  const { collection } = useContext(StoreContext);
  const showCollection = () => collection?.showCollection();
  const triggerComparism = () =>  collection?.startComparism();

  return (
    <div
      className="my-cranach"
      data-component="structure/interacting/my-cranach"
    >
      <h2 className="my-cranach__title">My Cranach</h2>

      <ul>
      <li
          className="btn btn--is-reduced btn--is-stacked"
          onClick={() => showCollection()}
        >
          <i className="icon">collections_bookmark</i>
          {t('Show My Collection')}

        </li>

        <li
          className="btn btn--is-reduced btn--is-stacked"
          onClick={() => triggerComparism()}
        >
          <i className="icon">compare</i>
          {t('Compare Artefacts')}

        </li>
      </ul>
    </div>
  );
};

export default observer(MyCranach);
