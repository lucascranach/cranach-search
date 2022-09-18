import React, { FC, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import Size from '../../../base/visualizing/size';
import translations from './translations.json';
import './my-cranach.scss';


import StoreContext from '../../../../store/StoreContext';

type Props = {
  isActive: boolean,
};

const MyCranach: FC<Props> = ({
  isActive = false,
}) => {
  const { root: { collection, ui } } = useContext(StoreContext);
  const { t } = ui.useTranslation('Search', translations);
  const isActiveClassName = isActive ? 'my-cranach--is-active' : '';

  return (
    <div
    className={`my-cranach ${isActiveClassName}`}
      data-component="structure/interacting/my-cranach"
    >
      <h2 className="my-cranach__title">{t('Show My Collection')}<Size size={collection.size} /></h2>
    </div>
  );
};

export default observer(MyCranach);
