
import { makeAutoObservable } from 'mobx';
import { EntityType } from '../../api/globalSearch';
import { RootStoreInterface } from '../rootStore';

const CRANACH_SEARCH_LOCALSTORAGE_KEY = 'collection';

interface CollectionItem {
  inventoryNumber: string;
  objectName: string;
  entityType: EntityType,
  collectedAtTimestamp: string;
};

export default class Collection implements CollectionStoreInterface {
  rootStore: RootStoreInterface;
  artefacts: CollectionItem[] = [];

  constructor(rootStore: RootStoreInterface) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
    this.readCollectionFromLocalStorage();
  }

  /* Getters */
  get size() {
    return this.artefacts.length;
  }

  get collectionLocalStorageKey(): string {
    const { mode } = this.rootStore;
    return CRANACH_SEARCH_LOCALSTORAGE_KEY + (mode ? `:${mode}` : '');
  }

  /* Actions */
  addArtefactToCollection(inventoryNumber: string) {
    const matchingItem = this.rootStore.lighttable.result?.items.find(item => item.id === inventoryNumber);

    if (!matchingItem) return;

    const mappedItem: CollectionItem = {
      inventoryNumber: matchingItem.id,
      objectName: matchingItem.objectName,
      entityType: matchingItem.entityType,
      collectedAtTimestamp: (new Date()).toISOString(),
    };

    this.artefacts.push(mappedItem);
    this.storeCollectionToLocalStorage();

    return true;
  }

  removeArtefactFromCollection(inventoryNumber: string) {
    this.artefacts = this.artefacts.filter(item => item.inventoryNumber != inventoryNumber);
    this.storeCollectionToLocalStorage();
    return true;
  }

  showCollection() {
    const inventoryNumbers = this.artefacts.map(artefact => artefact.inventoryNumber);

    // TODO: do not depend on searchWorks
    this.rootStore.searchWorks.resetEntityType();
    this.rootStore.searchWorks.triggerUserCollectionRequest(inventoryNumbers);
    return true;
  }

  collectionIncludesArtefact(inventoryNumber: string): boolean {
    return this.artefacts.some(artefact => artefact.inventoryNumber === inventoryNumber);
  }

  private readCollectionFromLocalStorage() {
    const artefactsJSON = localStorage.getItem(this.collectionLocalStorageKey);
    if(artefactsJSON) {
      this.artefacts = <CollectionItem[]>JSON.parse(artefactsJSON);
    }
    return true;
  }

  private storeCollectionToLocalStorage(): void {
    localStorage.setItem(this.collectionLocalStorageKey, JSON.stringify(this.artefacts));
  }
}

export interface CollectionStoreInterface {
  size: number;
  showCollection(): void;
  addArtefactToCollection(artefact: string): void;
  removeArtefactFromCollection(artefact: string): void;
  collectionIncludesArtefact(id: string): boolean;
}
