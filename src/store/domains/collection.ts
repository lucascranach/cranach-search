
import { makeAutoObservable } from 'mobx';
import GlobalSearch from './globalSearch';

const cranachCompareURL = import.meta.env.VITE_CRANACH_COMPARE_URL;
export default class Collection implements CollectionStoreInterface {
  artefacts: string[] = [];
  globalSearchStore: GlobalSearch;

  constructor(globalSearchStore: GlobalSearch) {
    makeAutoObservable(this);
    this.globalSearchStore = globalSearchStore;
    this.readCollectionFromLocalStorage();
  }

  get size() {
    return this.artefacts.length;
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
    this.globalSearchStore?.resetEntityType();
    const artefactInventoryNumbers = this.artefacts.map(artefact => artefact.replace(/:.*/, ''));
    this.globalSearchStore.filters.id = artefactInventoryNumbers.join(',');
    this.globalSearchStore.triggerFilterRequest();
    return true;
  }

  startComparism() {
    const url = `${cranachCompareURL}${this.artefacts.join(',')}`;
    window.open(url, "_blank");
    return true;
  }
}

export interface CollectionStoreInterface {
  artefacts: string[];
  size: number;
  showCollection(): void;
  startComparism(): void;
  readFromLocalStorage(): void;
  addArtefactToCollection(artefact: string): void;
  removeArtefactFromCollection(artefact: string): void;
}
