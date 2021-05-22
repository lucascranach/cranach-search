
import { makeAutoObservable } from 'mobx';

export default class Collection implements CollectionStoreInterface {
  artefacts: string[] = [];

  constructor() {
    makeAutoObservable(this);
    this.readCollectionFromLocalStorage();
  }

  /* Actions */
  addArtefactToCollection(artefact: string) {
    this.artefacts.push(artefact);
    localStorage.setItem('collection', this.artefacts);
    return true;
  }

  removeArtefactFromCollection(artefact: string) {
    this.artefacts.push(artefact);
    localStorage.setItem('collection', this.artefacts);
    return true;
  }

  readCollectionFromLocalStorage() {
    const artefacts = localStorage.getItem('collection') ? localStorage.getItem('collection')?.split(',') : [];
    this.artefacts = artefacts;
  }
}

export interface CollectionStoreInterface {
  readCollectionFromLocalStorage(): void;
  addArtefactToCollection(artefact: string): void;
  removeArtefactFromCollection(artefact: string): void;
}
