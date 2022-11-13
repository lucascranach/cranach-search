
import { makeAutoObservable } from 'mobx';
import { EntityType } from '../../api/types';
import { RootStoreInterface } from '../rootStore';
import CollectionAPI_ from '../../api/collection';

type CollectionAPI = typeof CollectionAPI_;

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
  collectionAPI: CollectionAPI;

  constructor(rootStore: RootStoreInterface, collectionAPI: CollectionAPI) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
    this.collectionAPI = collectionAPI;
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

  async showCollection() {
    const inventoryNumbers = this.artefacts.map(artefact => artefact.inventoryNumber);

    if (inventoryNumbers.length === 0) {
      this.rootStore.lighttable.setResult(null);
      return;
    }

    const { lang } = this.rootStore.ui;
    this.rootStore.lighttable.setResultLoading(true);
    const response = await this.collectionAPI.getByInventoryNumbers(
      inventoryNumbers,
      lang,
    );
    this.rootStore.lighttable.setResult(response.result);
    this.rootStore.lighttable.setResultLoading(false);
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
