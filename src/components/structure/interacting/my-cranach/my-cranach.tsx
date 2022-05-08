import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import Size from '../../../base/visualizing/size';
import translations from './translations.json';
import './my-cranach.scss';


import StoreContext, { UISidebarContentType, UISidebarStatusType } from '../../../../store/StoreContext';

const MyCranach = () => {
  const { root: { collection, ui } } = useContext(StoreContext);
  const { t } = ui.useTranslation('Search', translations);
  const isActiveMyCranach = ui.sidebarStatus === UISidebarStatusType.MAXIMIZED && ui.sidebarContent === UISidebarContentType.MY_CRANACH ? 'my-cranach--is-active' : '';

  return (
    <div
    className={`my-cranach ${isActiveMyCranach}`}
      data-component="structure/interacting/my-cranach"
    >
      <h2 className="my-cranach__title">{t('Show My Collection')}<Size size={collection.size} /></h2>
    </div>
  );
};

export default observer(MyCranach);
