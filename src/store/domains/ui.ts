
import { makeAutoObservable } from 'mobx';

export default class UI implements UIStoreInterface {
  lang:string = 'de'
  sidebar: string = 'myCranach'

  constructor() {
    makeAutoObservable(this);
  }


  /* Actions */

  setLanguage(lang: string) {
    this.lang = lang;
  }

  toggleSidebar() {
    this.sidebar = this.sidebar === 'filter' ? 'myCranach' : 'filter';
  }
}

export interface UIStoreInterface {
  setLanguage(lang: string): void;
  toggleSidebar(): void;
  sidebar: string;
}
