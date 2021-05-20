
import { makeAutoObservable } from 'mobx';

export default class Collection implements CollectionStoreInterface {
  lang = 'de'

  constructor() {
    makeAutoObservable(this);
  }


  /* Actions */

  addItem(lang: string) {
    this.lang = lang;
  }
}

export interface CollectionStoreInterface {
  addItem(lang: string): void;
}
