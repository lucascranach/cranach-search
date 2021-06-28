import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import Size from '../../../base/visualizing/size';
import translations from './translations.json';
import './my-cranach.scss';

import StoreContext from '../../../../store/StoreContext';

const MyCranach = () => {
  const { collection, ui } = useContext(StoreContext);
  const { t } = ui.useTranslation('SearchSidebar', translations);
  const triggerComparism = () => collection.startComparism();
  const compareIsActive = collection.size && collection.size > 1 ? 'btn--is-active' : 'btn--is-disabled';

  return (
    <div
      className="my-cranach"
      data-component="structure/interacting/my-cranach"
    >
      <h2 className="my-cranach__title">{t('Show My Collection')}<Size size={collection.size} /></h2>

      <ul>

        <li
          className={`btn btn--is-reduced btn--is-stacked ${compareIsActive}`}
          onClick={() => triggerComparism()}
        >
          <i className="icon icon--is-medium icon--is-inline">compare</i>
          {t('Compare Artefacts')}

        </li>
      </ul>
    </div>
  );
};

export default observer(MyCranach);
