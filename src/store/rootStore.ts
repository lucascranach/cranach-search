import { makeAutoObservable } from 'mobx';
import { History } from 'history';

import WorksAPI from '../api/works';
import ArchivalsAPI from '../api/archivals';

import UI, { UIStoreInterface } from './domains/ui';
import Routing, { RoutingStoreInterface } from './domains/routing';
import SearchWorks, { SearchWorksStoreInterface } from './domains/searchWorks';
import Collection, { CollectionStoreInterface } from './domains/collection';
import Lighttable, { LighttableStoreInterface } from './domains/lighttable';
import SearchArchivals, { SearchArchivalsStoreInterface } from './domains/searchArchivals';

export default class RootStore implements RootStoreInterface {
  public readonly mode;
  public ui: UIStoreInterface;
  public routing: RoutingStoreInterface;
  public collection: CollectionStoreInterface;
  public lighttable: LighttableStoreInterface;
  public searchWorks: SearchWorksStoreInterface;
  public searchArchivals: SearchArchivalsStoreInterface;

  constructor(history: History) {
    makeAutoObservable(this);

    this.mode = !['production', 'development'].includes(import.meta.env.MODE)
      ? (import.meta.env.MODE).trim()
      : '';
    this.routing = new Routing(this, history);
    this.ui = new UI(this);
    this.collection = new Collection(this);
    this.lighttable = new Lighttable(this);
    this.searchWorks = new SearchWorks(this, WorksAPI);
    this.searchArchivals = new SearchArchivals(this, ArchivalsAPI);
  }
}

export interface RootStoreInterface {
  mode: string,
  ui: UIStoreInterface,
  routing: RoutingStoreInterface,
  lighttable: LighttableStoreInterface,
  collection: CollectionStoreInterface,
  searchWorks: SearchWorksStoreInterface,
  searchArchivals: SearchArchivalsStoreInterface,
}
