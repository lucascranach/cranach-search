import { makeAutoObservable } from 'mobx';
import { History } from 'history';

import WorksAPI from '../api/works';
import ArchivalsAPI from '../api/archivals';
import LiteratureReferencesAPI from '../api/literature-references';
import CollectionAPI from '../api/collection';

import UI, { UIStoreInterface } from './domains/ui';
import Routing, { RoutingStoreInterface } from './domains/routing';
import SearchWorks, { SearchWorksStoreInterface } from './domains/searchWorks';
import Collection, { CollectionStoreInterface } from './domains/collection';
import Lighttable, { LighttableStoreInterface } from './domains/lighttable';
import SearchArchivals, { SearchArchivalsStoreInterface } from './domains/searchArchivals';
import SearchLiteratureReferences, { SearchLiteratureReferencesStoreInterface } from './domains/searchLiteratureReferences';

export default class RootStore implements RootStoreInterface {
  public readonly mode;
  public ui: UIStoreInterface;
  public routing: RoutingStoreInterface;
  public collection: CollectionStoreInterface;
  public lighttable: LighttableStoreInterface;
  public searchWorks: SearchWorksStoreInterface;
  public searchArchivals: SearchArchivalsStoreInterface;
  public searchLiteratureReferences: SearchLiteratureReferencesStoreInterface;

  constructor(history: History) {
    makeAutoObservable(this);

    this.mode = !['production', 'development'].includes(import.meta.env.MODE)
      ? (import.meta.env.MODE).trim()
      : '';
    this.routing = new Routing(this, history);
    this.lighttable = new Lighttable(this);
    this.ui = new UI(this);
    this.collection = new Collection(this, CollectionAPI);
    this.searchWorks = new SearchWorks(this, WorksAPI);
    this.searchArchivals = new SearchArchivals(this, ArchivalsAPI);
    this.searchLiteratureReferences = new SearchLiteratureReferences(this, LiteratureReferencesAPI);

    this.routing.init();
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
  searchLiteratureReferences: SearchLiteratureReferencesStoreInterface;
}
