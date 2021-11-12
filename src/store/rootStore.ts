import { makeAutoObservable } from 'mobx';
import { History } from 'history';

import globalSearchAPI from '../api/globalSearch';

import UI, { UIStoreInterface } from './domains/ui';
import Routing, { RoutingStoreInterface } from './domains/routing';
import GlobalSearch, { GlobalSearchStoreInterface } from './domains/globalSearch';
import Collection, { CollectionStoreInterface } from './domains/collection';


export default class RootStore implements RootStoreInterface {
  public ui: UIStoreInterface;
  public routing: RoutingStoreInterface;
  public globalSearch: GlobalSearchStoreInterface;
  public collection: CollectionStoreInterface;

  constructor(history: History) {
    makeAutoObservable(this);

    this.ui = new UI(this);
    this.routing = new Routing(this, history);
    this.globalSearch = new GlobalSearch(this, globalSearchAPI);
    this.collection = new Collection(this);
  }

}

export interface RootStoreInterface {
  ui: UIStoreInterface,
  routing: RoutingStoreInterface,
  globalSearch: GlobalSearchStoreInterface,
  collection: CollectionStoreInterface,
}
