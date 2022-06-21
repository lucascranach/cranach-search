import React, { useContext } from 'react';
import StoreContext from '../../../../store/StoreContext';
import './logo.scss';

export default () => {

  const { root: { ui } } = useContext(StoreContext);

  const cdaContentURL: string = ui.lang === 'de'
    ? String(import.meta.env.VITE_CDA_CONTENT_URL_DE)
    : String(import.meta.env.VITE_CDA_CONTENT_URL_EN);

  return (
    <div className="logo" data-component="atoms/logo">
      <a href={cdaContentURL}>
        cda_&nbsp;
      </a>
    </div>
  )
}
