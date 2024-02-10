import React, { useContext } from 'react';
import StoreContext from '../../../../store/StoreContext';
import './logo.scss';

export default () => {

  const { root: { ui } } = useContext(StoreContext);
  const logoStyle = {
    height: '0.6em'
  };

  const cdaContentURL: string = ui.lang === 'de'
    ? String(import.meta.env.VITE_CDA_CONTENT_URL_DE)
    : String(import.meta.env.VITE_CDA_CONTENT_URL_EN);

  return (
    <div className="logo" data-component="atoms/logo">
      <a href={cdaContentURL}>
        <img className="cda-logo" style={logoStyle} src="./assets/images/cda-logo-bw.svg" alt="CDA Logo" />
      </a>
    </div>
  )
}
