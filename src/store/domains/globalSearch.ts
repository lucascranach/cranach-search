
import { makeAutoObservable } from 'mobx';
import UI from './ui';
import GlobalSearchAPI_, {
  GlobalSearchArtifact,
  GlobalSearchResult,
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
  id: string,
  filterInfos: Set<string>,
};

export default class GlobalSearch implements GlobalSearchStoreInterface {
  uiStore: UI;

  globalSearchAPI: GlobalSearchAPI;

  allFieldsTerm: string = '';

  loading: boolean = false;

  result: GlobalSearchResult | null = null;

  error: string | null = null;

  filters: FilterType = {
    dating: {
      from: '',
      to: '',
    },
    size: 50,
    from: 0,
    entityType: EntityType.UNKNOWN,
    id: '',
    filterInfos: new Set(),
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

  toggleFilterInfoActiveStatus(filterInfoId: string) {
    if (this.filters.filterInfos.has(filterInfoId)) {
      this.filters.filterInfos.delete(filterInfoId);
    } else {
      this.filters.filterInfos.add(filterInfoId);
    }

    this.triggerFilterRequest();
  }

  setEntityType(entityType: EntityType) {
    this.filters.entityType = entityType;
    this.triggerFilterRequest();
  }

  resetEntityType() {
    this.filters.entityType = EntityType.UNKNOWN;
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

  setFrom(from: number): void;

  toggleFilterInfoActiveStatus(filterId: string): void;

  triggerFilterRequest(): void;

  resetEntityType(): void;

}
