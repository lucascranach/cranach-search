import { makeAutoObservable } from 'mobx';
import i18n from 'i18next';
import {
  initReactI18next,
  useTranslation,
  UseTranslationResponse,
} from 'react-i18next';
import type {
  ObserverInterface as RoutingObservableInterface,
  NotificationInterface as RoutingNotificationInterface,
} from './routing';
import {
  NotificationType as RoutingNotificationType,
} from './routing';
import { RootStoreInterface } from '../rootStore';

const CRANACH_SEARCH_LOCALSTORAGE_KEY = 'cranachSearchUI';

export default class UI implements UIStoreInterface, RoutingObservableInterface {
  rootStore: RootStoreInterface
  lang: string = 'de';
  sidebarContent: UISidebarContentType = UISidebarContentType.FILTER;
  sidebarStatus: UISidebarStatusType = UISidebarStatusType.MAXIMIZED;
  overviewViewType: UIOverviewViewType = UIOverviewViewType.CARD;
  secondaryNavigationIsVisible: boolean = false;
  additionalSearchInputsVisible: boolean = false;
  allowedLangs: Record<string, string> = { de: 'DE', en: 'EN' };
  idsOfExpandedFiltersInFilterTree: string[] = [];

  constructor(rootStore: RootStoreInterface) {
    makeAutoObservable(this);

    this.rootStore = rootStore;

    i18n
    .use(initReactI18next)
    .init({
      debug: false,

      interpolation: {
        escapeValue: false,
      },

      react: {
        useSuspense: false,
      },
    });

    this.rootStore.routing.addObserver(this);
    this.loadFromLocalStorage();
  }

  /* Getters */

  get searchUiLocalStorageKey(): string {
    const { mode } = this.rootStore;
    return CRANACH_SEARCH_LOCALSTORAGE_KEY + (mode ? `:${mode}` : '');
  }

  /* Actions */

  setLanguage(lang: string) {
    this.lang = lang;

    i18n.changeLanguage(this.lang);

    this.setRoutingForLanguage();
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

  setAdditionalSearchInputsVisible(isVisible: boolean) {
    this.additionalSearchInputsVisible = isVisible;
    this.updateLocalStorage();
  }

  filterItemIsExpanded(filterItemId: string): boolean {
    return this.idsOfExpandedFiltersInFilterTree.includes(filterItemId);
  }

  setFilterItemExpandedState(filterItemId: string, collapseState: boolean): void {
    this.idsOfExpandedFiltersInFilterTree = this.idsOfExpandedFiltersInFilterTree.filter(
      (currFilterItemId) => currFilterItemId !== filterItemId,
    );

    if (collapseState) {
      this.idsOfExpandedFiltersInFilterTree.push(filterItemId);
    }

    this.updateLocalStorage();
  }

  updateLocalStorage() {
    const item: StorageItemType = {
      sidebarContent: this.sidebarContent,
      sidebarStatus: this.sidebarStatus,
      overviewViewType: this.overviewViewType,
      secondaryNavigationIsVisible: this.secondaryNavigationIsVisible,
      additionalSearchInputsVisible: this.additionalSearchInputsVisible,
      idsOfExpandedFiltersInFilterTree: this.idsOfExpandedFiltersInFilterTree,
    }

    window.localStorage.setItem(this.searchUiLocalStorageKey, JSON.stringify(item));
  }

  loadFromLocalStorage() {
    const rawItem = window.localStorage.getItem(this.searchUiLocalStorageKey);

    if (!rawItem) return;

    const item = JSON.parse(rawItem) as Partial<StorageItemType>;

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

    /* Secondary navigation visibility */
    this.secondaryNavigationIsVisible = !!item.secondaryNavigationIsVisible;

    /* Additional search input fields visibility */
    this.additionalSearchInputsVisible = !!item.additionalSearchInputsVisible;

    /* Ids of FilterItems collapsed in the filter tree */
    if (item.idsOfExpandedFiltersInFilterTree) {
      this.idsOfExpandedFiltersInFilterTree = item.idsOfExpandedFiltersInFilterTree;
    }
  }

  notify(notification: RoutingNotificationInterface) {
    switch (notification.type) {
      case RoutingNotificationType.PATH_INIT:
      case RoutingNotificationType.PATH_CHANGE:
        notification.params.forEach(([name, value]) => {
          switch (name) {
            case 'lang':
              this.handleRoutingNotificationLanguage(value);
              return;
          }
        });
        break;
    }
  }

  private setRoutingForLanguage() {
    this.rootStore.routing.updateLanguageParam(this.lang);
  }

  private handleRoutingNotificationLanguage(value: string) {
    if (value in this.allowedLangs) {
      this.setLanguage(value);
    } else {
      this.setLanguage(this.lang);
    }
  }
}

type StorageItemType = {
  sidebarContent: UISidebarContentType;
  sidebarStatus: UISidebarStatusType;
  overviewViewType: UIOverviewViewType;
  secondaryNavigationIsVisible: boolean;
  additionalSearchInputsVisible: boolean;
  idsOfExpandedFiltersInFilterTree: string[];
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
  additionalSearchInputsVisible: boolean;
  allowedLangs: Record<string, string>;
  setLanguage(lang: string): void;
  setSideBarContent(content: UISidebarContentType): void;
  setSideBarStatus(status: UISidebarStatusType): void;
  setOverviewViewType(type: UIOverviewViewType): void;
  setSecondaryNavigationIsVisible(isVisible: boolean): void;
  setAdditionalSearchInputsVisible(isVisible: boolean): void;
  useTranslation(namespace: string, resourceBundle: Record<string, Record<string, string>>): UseTranslationResponse<string>;
  filterItemIsExpanded(filterItemId: string): boolean;
  setFilterItemExpandedState(filterItemId: string, collapseState: boolean): void;
}
