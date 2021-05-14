
import { makeAutoObservable } from 'mobx';
import UI from './ui';
import GlobalSearchAPI_, {
  GlobalSearchArtifact,
  GlobalSearchResults,
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
};

export default class GlobalSearch implements GlobalSearchStoreInterface {
  uiStore: UI;

  globalSearchAPI: GlobalSearchAPI;

  allFieldsTerm: string = '';

  loading: boolean = false;

  results: GlobalSearchArtifact[] = [];

  hits: number = 0;

  error: string | null = null;

  filters: APIFilterType = {
    dating: {
      from: '',
      to: '',
    },
    size: 50,
    from: 0,
    entityType: EntityType.UNKNOWN,
  };

  debounceWaitInMSecs: number = 500;
  debounceHandler: undefined | number = undefined;

  constructor(uiStore: UI, globalSearchAPI: GlobalSearchAPI) {
    makeAutoObservable(this);

    this.uiStore = uiStore;
    this.globalSearchAPI = globalSearchAPI;
  }


  /* Computed */

  get flattenedSearchResultItems(): GlobalSearchArtifact[] {
    return this.results;
  }

  /* Actions */

  setAllFieldsTerm(allFieldsTerm: string) {
    this.allFieldsTerm = allFieldsTerm;
  }

  setSearchLoading(loading: boolean) {
    this.loading = loading;
  }

  setSearchResults(results: GlobalSearchResults) {
    this.results = results.items;
    this.hits = results.meta.hits;
  }

  resetSearchResults() {
    this.results = [];
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

  setEntityType(entityType: EntityType) {
    this.filters.entityType = entityType;
    this.triggerFilterRequest();
  }

  triggerFilterRequest() {
    clearTimeout(this.debounceHandler);

    this.debounceHandler = window.setTimeout(() => {
      const { lang } = this.uiStore;

      this.setSearchLoading(true);

      this.globalSearchAPI.searchByFiltersAndTerm(this.filters, this.allFieldsTerm, lang).then(
        (results: GlobalSearchResults) => this.setSearchResults(results),
        (err: Error) => this.setSearchFailed(err.toString()),
      ).finally(
        () => this.setSearchLoading(false),
      );
    }, this.debounceWaitInMSecs);
  }
}

export interface GlobalSearchStoreInterface {
  allFieldsTerm: string;

  loading: boolean;

  results: GlobalSearchResults;

  error: string | null;

  hits: number;

  filters: FilterType;

  debounceWaitInMSecs: number;

  debounceHandler: undefined | number;

  flattenedSearchResultItems: GlobalSearchArtifact[];

  setAllFieldsTerm(allFieldsTerm: string): void;

  setSearchLoading(loading: boolean): void;

  setSearchResults(results: GlobalSearchResults): void;

  resetSearchResults(): void;

  setSearchFailed(error: string | null): void;

  searchForAllFieldsTerm(allFieldsTerm: string): void;

  setDatingFrom(from: string): void;

  setDatingTo(to: string): void;

  setEntityType(entityType: EntityType): void;

  setFrom(from: number): void;

  triggerFilterRequest(): void;
}
