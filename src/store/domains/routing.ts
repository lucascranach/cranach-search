
import { makeAutoObservable } from 'mobx';

import UI from './ui';
import GlobalSearch from './globalSearch';


export default class Routing implements RoutingStoreInterface {
  uiStore: UI;

  globalSearch: GlobalSearch;

  name: string = '';

  constructor(uiStore: UI, globalSearch: GlobalSearch) {
    makeAutoObservable(this);

    this.uiStore = uiStore;
    this.globalSearch = globalSearch;
  }

  /* Actions */

  setName(name: string) {
    this.name = name;
  }
}

export interface RoutingStoreInterface {
  name: string;
}
