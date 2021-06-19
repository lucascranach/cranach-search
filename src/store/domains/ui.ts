
import { makeAutoObservable } from 'mobx';

export default class UI implements UIStoreInterface {
  lang: string = 'de';
  sidebar: UISidebarType = UISidebarType.MY_CRANACH;

  constructor() {
    makeAutoObservable(this);
  }


  /* Actions */

  setLanguage(lang: string) {
    this.lang = lang;
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
  setLanguage(lang: string): void;
  toggleSidebar(): void;
  sidebar: UISidebarType;
}
