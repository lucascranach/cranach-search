
import { makeAutoObservable } from 'mobx';
import i18n from 'i18next';
import {
  initReactI18next,
  useTranslation,
  UseTranslationResponse,
} from 'react-i18next';


export default class UI implements UIStoreInterface {
  lang: string = 'de';
  sidebar: UISidebarType = UISidebarType.MY_CRANACH;

  constructor() {
    makeAutoObservable(this);

    i18n
    .use(initReactI18next)
    .init({
      lng: this.lang,

      debug: false,

      interpolation: {
        escapeValue: false,
      },

      react: {
        useSuspense: false,
      },
    });
  }

  /* Actions */

  setLanguage(lang: string) {
    this.lang = lang;

    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }

  useTranslation(namespace: string, resourceBundle: Record<string, Record<string, string>>) {
    Object.entries(resourceBundle).forEach((entry) => {
      i18n.addResourceBundle(entry[0], namespace, entry[1]);
    });

    return useTranslation(namespace);
  }

  toggleSidebar() {
    this.sidebar = (this.sidebar === UISidebarType.FILTER)
      ? UISidebarType.MY_CRANACH
      : UISidebarType.FILTER;
  }
}

export enum UISidebarType {
  MY_CRANACH = 'myCranach',
  FILTER = 'filter',
}
export interface UIStoreInterface {
  lang: string;
  sidebar: UISidebarType;
  setLanguage(lang: string): void;
  toggleSidebar(): void;
  useTranslation(namespace: string, resourceBundle: Record<string, Record<string, string>>): UseTranslationResponse<string>;
}
