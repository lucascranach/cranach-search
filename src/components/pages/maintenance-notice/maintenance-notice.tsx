import React, { FC, useEffect, useState } from 'react';

import Btn from '../../base/interacting/btn';
import cdaLogo from '../../base/visualizing/logo/cda-logo-bw.svg';
import translations from './translations.json';
import './maintenance-notice.scss';

type Lang = keyof typeof translations;

const ALLOWED_LANGS: Record<Lang, string> = { de: 'DE', en: 'EN' };
const DEFAULT_LANG: Lang = 'de';

const isLang = (value: string): value is Lang => value in ALLOWED_LANGS;

/* The language is the first path segment, e.g. /de/search/ or /en/search/ */
const getLangFromPath = (): Lang => {
  const [firstSegment = ''] = window.location.pathname.split('/').filter((seg) => !!seg);

  return isLang(firstSegment) ? firstSegment : DEFAULT_LANG;
};

/* Mirrors the path handling of the routing store, so a reload keeps the chosen language */
const setLangInPath = (lang: Lang) => {
  const segments = window.location.pathname.split('/').filter((seg) => !!seg);

  if (segments.length && isLang(segments[0])) {
    segments[0] = lang;
  } else {
    segments.unshift(lang);
  }

  const url = `/${segments.join('/')}/${window.location.search}${window.location.hash}`;
  window.history.replaceState(window.history.state, '', url);
};

type Props = {
  onDismiss: () => void,
};

const MaintenanceNotice: FC<Props> = ({ onDismiss }) => {
  const [lang, setLang] = useState<Lang>(getLangFromPath);
  const t = translations[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = `cda :: Cranach Digital Archive :: ${t.title}`;
  }, [lang]);

  const changeLang = (newLang: Lang) => {
    setLang(newLang);
    setLangInPath(newLang);
  };

  const cdaContentURL = lang === 'de'
    ? String(import.meta.env.VITE_CDA_CONTENT_URL_DE)
    : String(import.meta.env.VITE_CDA_CONTENT_URL_EN);

  return (
    <div className="maintenance-notice" data-component="pages/maintenance-notice">
      <header className="maintenance-notice__header">
        <a href={cdaContentURL}>
          <img className="maintenance-notice__logo" src={cdaLogo} alt="CDA Logo" />
        </a>

        <ul className="maintenance-notice__langs">
          {Object.entries(ALLOWED_LANGS).map(([langCode, abbreviation]) => (
            <li key={langCode}>
              <button
                type="button"
                className={`maintenance-notice__lang ${langCode === lang ? 'maintenance-notice__lang--is-active' : ''}`}
                aria-pressed={langCode === lang}
                lang={langCode}
                onClick={() => changeLang(langCode as Lang)}
              >{abbreviation}</button>
            </li>
          ))}
        </ul>
      </header>

      <main className="maintenance-notice__content">
        <h1 className="title">{t.title}</h1>
        <p>{t.reason}</p>
        <p className="maintenance-notice__availability">{t.availability}</p>
        <p>{t.apology}</p>

        <div className="maintenance-notice__vpn">
          <p>{t.vpnHint}</p>
          <Btn
            className="maintenance-notice__continue"
            click={onDismiss}
          >
            {t.continue}
            <i className="icon" aria-hidden="true">arrow_forward</i>
          </Btn>
        </div>
      </main>
    </div>
  );
};

export default MaintenanceNotice;
