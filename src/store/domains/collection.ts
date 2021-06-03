
import { makeAutoObservable } from 'mobx';
import GlobalSearch from './globalSearch';

export default class Collection implements CollectionStoreInterface {
  artefacts: string[] = [];
  globalSearchStore: GlobalSearch;

  constructor(globalSearchStore: GlobalSearch) {
    makeAutoObservable(this);
    this.globalSearchStore = globalSearchStore;
    this.readCollectionFromLocalStorage();
  }

  readFromLocalStorage(): void {
    throw new Error('Method not implemented.');
  }

  /* Actions */
  addArtefactToCollection(artefact: string) {
    this.artefacts.push(artefact);
    localStorage.setItem('collection', this.artefacts.join(','));
    return true;
  }

  removeArtefactFromCollection(artefact: string) {
    this.artefacts = this.artefacts.filter(item => item != artefact);
    localStorage.setItem('collection', this.artefacts.join(','));
    return true;
  }

  readCollectionFromLocalStorage() {
    const artefacts = localStorage.getItem('collection');
    if(artefacts) {
      this.artefacts = artefacts.split(',');
    }
    return true;
  }

  showCollection() {
    this.readCollectionFromLocalStorage();
    this.globalSearchStore.filters.id = this.artefacts.join(',');
    this.globalSearchStore.triggerFilterRequest();

  }
}

export interface CollectionStoreInterface {
  artefacts: string[];
  showCollection(): void;
  readFromLocalStorage(): void;
  addArtefactToCollection(artefact: string): void;
  removeArtefactFromCollection(artefact: string): void;
}
