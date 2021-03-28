
import { makeAutoObservable } from 'mobx';

export default class UI implements UIStoreInterface {
  lang = 'de'

  constructor() {
    makeAutoObservable(this);
  }


  /* Actions */

  setLanguage(lang: string) {
    this.lang = lang;
  }
}

export interface UIStoreInterface {
  setLanguage(lang: string): void;
}
