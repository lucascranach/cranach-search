import { makeAutoObservable } from 'mobx';
import i18n from 'i18next';
import {
  initReactI18next,
  useTranslation,
  UseTranslationResponse,
} from 'react-i18next';
import { RootStoreInterface } from '../rootStore';

const CRANACH_SEARCH_LOCALSTORAGE_KEY = 'cranachSearchUI';

export default class UI implements UIStoreInterface {
  rootStore: RootStoreInterface
  lang: string = 'de';
  sidebarContent: UISidebarContentType = UISidebarContentType.FILTER;
  sidebarStatus: UISidebarStatusType = UISidebarStatusType.MAXIMIZED;
  overviewViewType: UIOverviewViewType = UIOverviewViewType.CARD;
  secondaryNavigationIsVisible: boolean = false;
  allowedLangs: Record<string, string> = { de: 'DE', en: 'EN' };

  constructor(rootStore: RootStoreInterface) {
    makeAutoObservable(this);

    this.rootStore = rootStore;

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

    this.loadFromLocalStorage();
  }

  /* Actions */

  setLanguage(lang: string) {
    this.lang = lang;

    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }

    this.rootStore.routing.updateLanguageParam(this.lang);
  }

  useTranslation(namespace: string, resourceBundle: Record<string, Record<string, string>>) {
    Object.entries(resourceBundle).forEach((entry) => {
      i18n.addResourceBundle(entry[0], namespace, entry[1]);
    });

    return useTranslation(namespace);
  }

  setSideBarContent(content: UISidebarContentType) {
    this.sidebarContent = content;
    this.updateLocalStorage();
  }

  setSideBarStatus(status: UISidebarStatusType) {
    this.sidebarStatus = status;
  }

  setOverviewViewType(type: UIOverviewViewType) {
    this.overviewViewType = type;
    this.updateLocalStorage();
  }

  setSecondaryNavigationIsVisible(isVisible: boolean) {
    this.secondaryNavigationIsVisible = isVisible;
    this.updateLocalStorage();
  }

  updateLocalStorage() {
    const item: StorageItemType = {
      sidebarContent: this.sidebarContent,
      sidebarStatus: this.sidebarStatus,
      overviewViewType: this.overviewViewType,
      secondaryNavigationIsVisible: this.secondaryNavigationIsVisible,
    }

    window.localStorage.setItem(CRANACH_SEARCH_LOCALSTORAGE_KEY, JSON.stringify(item));
  }

  loadFromLocalStorage() {
    const rawItem = window.localStorage.getItem(CRANACH_SEARCH_LOCALSTORAGE_KEY);

    if (!rawItem) return;

    const item = JSON.parse(rawItem) as StorageItemType;

    /* Sidebar content */
    if (item.sidebarContent && Object.values(UISidebarContentType).includes(item.sidebarContent )) {
      this.sidebarContent = item.sidebarContent;
    }

    /* Sidebar status */
    if (item.sidebarStatus && Object.values(UISidebarStatusType).includes(item.sidebarStatus)) {
      this.sidebarStatus = item.sidebarStatus;
    }

    /* Sidebar status */
    if (item.overviewViewType && Object.values(UIOverviewViewType).includes(item.overviewViewType)) {
      this.overviewViewType = item.overviewViewType;
    }

    /* Secondary navigation visibilitu */
    this.secondaryNavigationIsVisible = item.secondaryNavigationIsVisible;
  }
}

type StorageItemType = {
  sidebarContent: UISidebarContentType;
  sidebarStatus: UISidebarStatusType;
  overviewViewType: UIOverviewViewType;
  secondaryNavigationIsVisible: boolean;
}

export enum UISidebarContentType {
  MY_CRANACH = 'myCranach',
  FILTER = 'filter',
}
export enum UISidebarStatusType {
  MAXIMIZED = 'maximized',
  MINIMIZED = 'minimized',
}
export enum UIOverviewViewType {
  CARD = 'card',
  CARD_SMALL = 'card-small',
  LIST = 'list',
}
export interface UIStoreInterface {
  lang: string;
  sidebarContent: UISidebarContentType;
  sidebarStatus: UISidebarStatusType;
  overviewViewType: UIOverviewViewType;
  secondaryNavigationIsVisible: boolean;
  allowedLangs: Record<string, string>;
  setLanguage(lang: string): void;
  setSideBarContent(content: UISidebarContentType): void;
  setSideBarStatus(status: UISidebarStatusType): void;
  setOverviewViewType(type: UIOverviewViewType): void;
  setSecondaryNavigationIsVisible(isVisible: boolean): void;
  useTranslation(namespace: string, resourceBundle: Record<string, Record<string, string>>): UseTranslationResponse<string>;
}
