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

export default class UI implements UIStoreInterface, RoutingObservableInterface {
  rootStore: RootStoreInterface
  lang: string = 'de';
  sidebar: UISidebarType = UISidebarType.FILTER;
  overviewViewType: UIOverviewViewType = UIOverviewViewType.CARD;
  allowedLangs: Record<string, string> = { de: 'DE', en: 'EN' };

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

  toggleSidebar() {
    this.sidebar = (this.sidebar === UISidebarType.FILTER)
      ? UISidebarType.MY_CRANACH
      : UISidebarType.FILTER;
  }

  setSideBarContent(type: UISidebarType) {
    this.sidebar = type;
  }

  setOverviewViewType(type: UIOverviewViewType) {
    this.overviewViewType = type;
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

export enum UISidebarType {
  MY_CRANACH = 'myCranach',
  FILTER = 'filter',
  NONE = '',
}
export enum UIOverviewViewType {
  CARD = 'card',
  CARD_SMALL = 'card-small',
  LIST = 'list',
}
export interface UIStoreInterface {
  lang: string;
  sidebar: UISidebarType;
  overviewViewType: UIOverviewViewType;
  allowedLangs: Record<string, string>;
  setLanguage(lang: string): void;
  toggleSidebar(): void;
  setSideBarContent(type: UISidebarType): void;
  setOverviewViewType(type: UIOverviewViewType): void;
  useTranslation(namespace: string, resourceBundle: Record<string, Record<string, string>>): UseTranslationResponse<string>;
}
