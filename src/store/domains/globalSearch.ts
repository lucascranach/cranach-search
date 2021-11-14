
import { makeAutoObservable } from 'mobx';
import UI from './ui';
import GlobalSearchAPI_, {
  GlobalSearchArtifact,
  GlobalSearchResult,
  EntityType,
} from '../../api/globalSearch';
export { EntityType as GlobalSearchEntityType } from '../../api/globalSearch';
export type {
  GlobalSearchFilterGroupItem,
  GlobalSearchFilterItem,
} from '../../api/globalSearch';


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
  filterGroups: Map<string, Set<string>>,
  isBestOf: boolean,
};

export type SingleFilter = {
  id: string,
  name: string,
  docCount: number,
}

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
    filterGroups: new Map(),
    isBestOf: false,
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

  get bestOfFilter(): SingleFilter | null {
    const isBestOfFilter = this.result?.singleFilters.find((item) => item.id === 'is_best_of');

    if (!isBestOfFilter) { return null; }

    return {
      name: 'Best of',
      id: isBestOfFilter.id,
      docCount: isBestOfFilter.doc_count,
    };
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

  setIsBestOf(isBestOf: boolean) {
    this.filters.isBestOf = isBestOf;
    this.triggerFilterRequest();
  }

  toggleFilterItemActiveStatus(groupKey: string, filterItemId: string) {
    const groupSet = this.filters.filterGroups.get(groupKey);

    if (groupSet) {
      if (groupSet.has(filterItemId)) {
        groupSet.delete(filterItemId);
      } else {
        groupSet.add(filterItemId);
      }

      if (groupSet.size === 0) {
        this.filters.filterGroups.delete(groupKey);
      }
    } else {
      this.filters.filterGroups.set(groupKey, new Set([filterItemId]));
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
      } catch(err: any) {
        this.setSearchFailed(err.toString());
      } finally {
        this.setSearchLoading(false);
      }
    }, this.debounceWaitInMSecs);
  }

  triggerUserCollectionRequest(ids: string[]) {

    (async () => {
      const { lang } = this.uiStore;
      this.setSearchLoading(true);
      try {
        const result = await this.globalSearchAPI.retrieveUserCollection(
          ids,
          lang,
        );
        this.setSearchResult(result);
      } catch(err: any) {
        this.setSearchFailed(err.toString());
      } finally {
        this.setSearchLoading(false);
      }
    })();
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

  bestOfFilter: SingleFilter | null;

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

  setIsBestOf(isBestOf: boolean): void;

  toggleFilterItemActiveStatus(groupKey: string, filterItemId: string): void;

  triggerFilterRequest(): void;

  triggerUserCollectionRequest(ids: string[]): void;

  resetEntityType(): void;

}
