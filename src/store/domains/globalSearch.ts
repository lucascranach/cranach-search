
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
  filterInfos: Set<string>,
};

export default class GlobalSearch implements GlobalSearchStoreInterface {
  uiStore: UI;

  globalSearchAPI: GlobalSearchAPI;

  freetextFields = {
    allFieldsTerm: '',
    title: '',
    location: '',
    inventoryNumber: '',
  }

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

  setFreetextFields(fields: Partial<FreeTextFields>) {
    this.freetextFields = {
      ...this.freetextFields,
      ...fields,
    };
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

  setDatingFrom(from: string) {
    this.filters.dating.from = from;
    this.triggerSearch();
  }

  setDatingTo(to: string) {
    this.filters.dating.to = to;
    this.triggerSearch();
  }

  setFrom(from: number) {
    this.filters.from = from;
    this.triggerSearch();
  }

  toggleFilterInfoActiveStatus(filterInfoId: string) {
    if (this.filters.filterInfos.has(filterInfoId)) {
      this.filters.filterInfos.delete(filterInfoId);
    } else {
      this.filters.filterInfos.add(filterInfoId);
    }

    this.triggerSearch();
  }

  setEntityType(entityType: EntityType) {
    this.filters.entityType = entityType;
    this.triggerSearch();
  }

  resetEntityType() {
    this.filters.entityType = EntityType.UNKNOWN;
  }

  triggerSearch() {

    clearTimeout(this.debounceHandler);

    this.debounceHandler = window.setTimeout(async () => {
      const { lang } = this.uiStore;
      this.setSearchLoading(true);
      try {
        const result = await this.globalSearchAPI.searchByFiltersAndTerm(
          this.filters,
          this.freetextFields,
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
      } catch(err) {
        this.setSearchFailed(err.toString());
      } finally {
        this.setSearchLoading(false);
      }
    })();
  }
}

export interface FreeTextFields {
  allFieldsTerm: string;
  title: string;
  location: string;
  inventoryNumber: string;
}


export interface GlobalSearchStoreInterface {
  freetextFields: FreeTextFields;

  loading: boolean;

  result: GlobalSearchResult | null;

  error: string | null;

  filters: FilterType;

  debounceWaitInMSecs: number;

  debounceHandler: undefined | number;

  flattenedSearchResultItems: GlobalSearchArtifact[];

  setFreetextFields(fields: Partial<FreeTextFields>): void;

  setSearchLoading(loading: boolean): void;

  setSearchResult(result: GlobalSearchResult | null): void;

  resetSearchResult(): void;

  setSearchFailed(error: string | null): void;

  setDatingFrom(from: string): void;

  setDatingTo(to: string): void;

  setEntityType(entityType: EntityType): void;

  setFrom(from: number): void;

  toggleFilterInfoActiveStatus(filterId: string): void;

  triggerSearch(): void;

  triggerUserCollectionRequest(ids: string[]): void;

  resetEntityType(): void;

}
