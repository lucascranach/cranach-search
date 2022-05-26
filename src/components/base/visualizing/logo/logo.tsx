import React, { useContext } from 'react';
import StoreContext from '../../../../store/StoreContext';
import './logo.scss';

export default () => {

  const { root: { ui } } = useContext(StoreContext);

  const cdaContentURL: string  = ui.lang === 'de'
    ? import.meta.env.VITE_CDA_CONTENT_URL_DE
    : import.meta.env.VITE_CDA_CONTENT_URL_EN;

  return (
    <a href={cdaContentURL}>

    <span
      className="logo"
      data-component="atoms/logo"
    >
    cda_&nbsp;
      </span>
  </a>
  )
}
