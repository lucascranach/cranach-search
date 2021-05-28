
import { makeAutoObservable, observable } from 'mobx';
import UI from './ui';
import Collection from './collection';
import GlobalSearchAPI_, {
  GlobalSearchArtifact,
  GlobalSearchResult,
  APIFilterType,
  EntityType,
} from '../../api/globalSearch';
export { EntityType as GlobalSearchEntityType } from '../../api/globalSearch';

type GlobalSearchAPI = typeof GlobalSearchAPI_;

export type FilterType = {
  dating: {
    from: string,
    to: string,
  },
  size: number,
  from: number,
  entityType: EntityType,
  thesaurus: Set<string>,
};

export default class GlobalSearch implements GlobalSearchStoreInterface {
  uiStore: UI;

  collectionStore: Collection;

  globalSearchAPI: GlobalSearchAPI;

  allFieldsTerm: string = '';

  loading: boolean = false;

  result: GlobalSearchResult | null = null;

  error: string | null = null;

  filters: APIFilterType = {
    dating: {
      from: '',
      to: '',
    },
    size: 50,
    from: 0,
    entityType: EntityType.UNKNOWN,
    thesaurus: observable.set(new Set()),
  };

  debounceWaitInMSecs: number = 500;
  debounceHandler: undefined | number = undefined;

  constructor(uiStore: UI, collectionStore: Collection, globalSearchAPI: GlobalSearchAPI) {
    makeAutoObservable(this);

    this.uiStore = uiStore;
    this.collectionStore = collectionStore;
    this.globalSearchAPI = globalSearchAPI;
  }


  /* Computed */

  get flattenedSearchResultItems(): GlobalSearchArtifact[] {
    return this.result?.items ?? [];
  }

  /* Actions */

  setAllFieldsTerm(allFieldsTerm: string) {
    this.allFieldsTerm = allFieldsTerm;
  }

  setSearchLoading(loading: boolean) {
    this.loading = loading;
  }

  setSearchResult(result: GlobalSearchResult | null) {
    this.result = result;
  }

  resetSearchResult() {
    this.result = null;
  }

  setSearchFailed(error: string | null) {
    this.error = error;
  }

  searchForAllFieldsTerm(allFieldsTerm: string) {
    this.setAllFieldsTerm(allFieldsTerm);
    this.triggerFilterRequest();
  }

  setDatingFrom(from: string) {
    this.filters.dating.from = from;

    this.triggerFilterRequest();
  }

  setDatingTo(to: string) {
    this.filters.dating.to = to;
    this.triggerFilterRequest();
  }

  setFrom(from: number) {
    this.filters.from = from;
    this.triggerFilterRequest();
  }

  toggleThesaurusFilterActiveStatus(filterId: string) {
    if (this.filters.thesaurus.has(filterId)) {
      this.filters.thesaurus.delete(filterId);
    } else {
      this.filters.thesaurus.add(filterId);
    }

    this.triggerFilterRequest();
  }

  setEntityType(entityType: EntityType) {
    this.filters.entityType = entityType;
    this.triggerFilterRequest();
  }

  setCollectionItemsAsIds() {
    this.triggerFilterRequest();
  }

  triggerFilterRequest() {

    clearTimeout(this.debounceHandler);

    this.debounceHandler = window.setTimeout(async () => {
      const { lang } = this.uiStore;

      this.setSearchLoading(true);

      try {
        const result = await this.globalSearchAPI.searchByFiltersAndTerm(
          this.filters,
          this.allFieldsTerm,
          lang,
        );
        this.setSearchResult(result);
      } catch(err) {
        this.setSearchFailed(err.toString());
      } finally {
        this.setSearchLoading(false);
      }
    }, this.debounceWaitInMSecs);
  }

}



export interface GlobalSearchStoreInterface {
  allFieldsTerm: string;

  loading: boolean;

  result: GlobalSearchResult | null;

  error: string | null;

  filters: FilterType;

  debounceWaitInMSecs: number;

  debounceHandler: undefined | number;

  flattenedSearchResultItems: GlobalSearchArtifact[];

  setAllFieldsTerm(allFieldsTerm: string): void;

  setSearchLoading(loading: boolean): void;

  setSearchResult(result: GlobalSearchResult | null): void;

  resetSearchResult(): void;

  setSearchFailed(error: string | null): void;

  searchForAllFieldsTerm(allFieldsTerm: string): void;

  setDatingFrom(from: string): void;

  setDatingTo(to: string): void;

  setEntityType(entityType: EntityType): void;

  setCollectionItemsAsIds(): void;

  setFrom(from: number): void;

  toggleThesaurusFilterActiveStatus(filterId: string): void;

  triggerFilterRequest(): void;

}
