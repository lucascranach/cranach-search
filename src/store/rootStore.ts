import { makeAutoObservable } from 'mobx';
import { History } from 'history';

import globalSearchAPI from '../api/globalSearch';

import UI, { UIStoreInterface } from './domains/ui';
import Routing, { RoutingStoreInterface } from './domains/routing';
import SearchWorks, { SearchWorksStoreInterface } from './domains/searchWorks';
import Collection, { CollectionStoreInterface } from './domains/collection';
import SearchBase, { SearchBaseStoreInterface } from './domains/searchBase';

export default class RootStore implements RootStoreInterface {
  public readonly mode;
  public ui: UIStoreInterface;
  public routing: RoutingStoreInterface;
  public collection: CollectionStoreInterface;
  public searchBase: SearchBaseStoreInterface;
  public searchWorks: SearchWorksStoreInterface;

  constructor(history: History) {
    makeAutoObservable(this);

    this.mode = !['production', 'development'].includes(import.meta.env.MODE)
      ? (import.meta.env.MODE).trim()
      : '';
    this.routing = new Routing(this, history);
    this.ui = new UI(this);
    this.collection = new Collection(this);
    this.searchBase = new SearchBase(this, globalSearchAPI);
    this.searchWorks = new SearchWorks(this, globalSearchAPI);
  }
}

export interface RootStoreInterface {
  mode: string,
  ui: UIStoreInterface,
  routing: RoutingStoreInterface,
  searchBase: SearchBaseStoreInterface,
  collection: CollectionStoreInterface,
  searchWorks: SearchWorksStoreInterface,
}
