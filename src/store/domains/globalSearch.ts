
import { reaction, makeAutoObservable } from 'mobx';
import type { RootStoreInterface } from '../rootStore';
import GlobalSearchAPI_, {
  GlobalSearchArtifact,
  GlobalSearchResult,
  EntityType,
} from '../../api/globalSearch';
import type {
  ObserverInterface as RoutingObservableInterface,
  NotificationInterface as RoutingNotificationInterface,
} from './routing';
import {
  NotificationType as RoutingNotificationType,
  ChangeAction as RoutingChangeAction,
  SearchQueryParamChange as RoutingSearchQueryParamChange,
} from './routing';
export { EntityType as GlobalSearchEntityType } from '../../api/globalSearch';
export type {
  GlobalSearchFilterGroupItem,
  GlobalSearchFilterItem,
} from '../../api/globalSearch';

const MIN_LOWER_DATING_YEAR = 1500;
const MAX_UPPER_DATING_YEAR = 1601;
const THRESOLD_UPPER_DATING_YEAR = 1600;
const INITIAL_DATING_RANGE_BOUNDS: [number, number] = [MIN_LOWER_DATING_YEAR, THRESOLD_UPPER_DATING_YEAR];
const INITIAL_RESULTS_SIZE = 50;
const INITIAL_RESULTS_FROM = 0;
const INITIAL_IS_BEST_OF = false;
const INITIAL_ENTITY_TYPE: EntityType = EntityType.UNKNOWN;
const INITIAL_FILTER_GROUPS = new Map();


type GlobalSearchAPI = typeof GlobalSearchAPI_;

export type FilterType = {
  dating: {
    fromYear: number,
    toYear: number,
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

export default class GlobalSearch implements GlobalSearchStoreInterface, RoutingObservableInterface {
  rootStore: RootStoreInterface;
  globalSearchAPI: GlobalSearchAPI;
  freetextFields = {
    allFieldsTerm: '',
    title: '',
    FRNr: '',
    location: '',
    inventoryNumber: '',
  }
  loading: boolean = false;
  result: GlobalSearchResult | null = null;
  error: string | null = null;
  datingRangeBounds: [number, number] = INITIAL_DATING_RANGE_BOUNDS;
  filters: FilterType = {
    dating: {
      fromYear: MIN_LOWER_DATING_YEAR,
      toYear: MAX_UPPER_DATING_YEAR,
    },
    size: INITIAL_RESULTS_SIZE,
    from: INITIAL_RESULTS_FROM,
    entityType: INITIAL_ENTITY_TYPE,
    id: '',
    filterGroups: INITIAL_FILTER_GROUPS,
    isBestOf: INITIAL_IS_BEST_OF,
  };

  debounceWaitInMSecs: number = 500;
  debounceHandler: undefined | number = undefined;

  constructor(rootStore: RootStoreInterface, globalSearchAPI: GlobalSearchAPI) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
    this.globalSearchAPI = globalSearchAPI;
    this.rootStore.routing.addObserver(this);

    reaction(
      () => this.rootStore.ui.lang,
      () => this.triggerFilterRequest(),
    );
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

  get currentResultPagePos(): number {
    return this.filters.from / this.filters.size;
  }

  get maxResultPages(): number {
    const hits = this.result?.meta.hits ?? 0;

    return Math.ceil(hits / this.filters.size);
  }

  /* Actions */

  setFreetextFields(fields: Partial<FreeTextFields>) {
    this.freetextFields = {
      ...this.freetextFields,
      ...fields,
    };
  }

  applyFreetextFields() {
    this.setRoutingForFreetextFields();
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

  storeSearchResult(result: GlobalSearchResult | null) {
    if (result === null) return;
    this.result = result;

    const artefactIds = this.result.items.map(item => item.id);
    localStorage.setItem('searchResult', artefactIds.join(','));

    return true;
  }

  setSearchFailed(error: string | null) {
    this.error = error;
  }

  setDating(fromYear: number, toYear: number) {
    this.filters.dating.fromYear = fromYear;
    this.filters.dating.toYear = toYear;
    this.resetFrom();
    this.setRoutingForDating();
    this.triggerFilterRequest();
  }

  setSize(size: number) {
    if (this.filters.size === size) return;

    this.filters.size = size;
    this.triggerFilterRequest();
  }

  setFrom(from: number) {
    this.filters.from = from;
  }

  resetFrom() {
    this.setFrom(0);
  }

  setIsBestOf(isBestOf: boolean) {
    this.filters.isBestOf = isBestOf;
    this.resetFrom();
    this.setRoutingForIsBestOf();
    this.triggerFilterRequest();
  }

  setPagination(relativePagePos: number) {
    if (relativePagePos === 0) return;

    const newFrom = this.filters.from + (this.filters.size * relativePagePos);
    const gatedFrom = Math.max(0, newFrom);

    this.setFrom(gatedFrom);
    this.setRoutingForPage();
    this.triggerFilterRequest();
  }

  jumpToPagePos(pagePos: number) {
    this.setFrom(pagePos * this.filters.size);
    this.setRoutingForPage();
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

    this.resetFrom();
    this.updateRoutingForFilterGroups(groupKey);
    this.triggerFilterRequest();
  }

  setEntityType(entityType: EntityType) {
    this.filters.entityType = entityType;
    this.resetFrom();
    this.setRoutingForEntityType();
    this.triggerFilterRequest();
  }

  resetEntityType() {
    this.filters.entityType = EntityType.UNKNOWN;
  }

  triggerFilterRequest() {
    clearTimeout(this.debounceHandler);

    this.debounceHandler = window.setTimeout(async () => {
      const { lang } = this.rootStore.ui;
      this.setSearchLoading(true);
      try {
        const updatedFilters: FilterType = {
          ...this.filters,
          dating: {
            ...this.filters.dating,
            /* resetting dating.toYear, if it is over the upper threshold -> we want all results between dating.fromYear and now */
            toYear: (this.filters.dating.toYear <= THRESOLD_UPPER_DATING_YEAR) ? this.filters.dating.toYear : 0,
          }
        };

        const result = await this.globalSearchAPI.searchByFiltersAndTerm(
          updatedFilters,
          this.freetextFields,
          lang,
        );
        this.setSearchResult(result);
        this.storeSearchResult(result);
      } catch(err: any) {
        this.setSearchFailed(err.toString());
      } finally {
        this.setSearchLoading(false);
      }
    }, this.debounceWaitInMSecs);
  }

  triggerUserCollectionRequest(ids: string[]) {

    (async () => {
      const { lang } = this.rootStore.ui;
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

  notify(notification: RoutingNotificationInterface) {
    switch (notification.type) {
      case RoutingNotificationType.SEARCH_INIT:
      case RoutingNotificationType.SEARCH_CHANGE:
        notification.params.forEach(([name, value]) => {
          switch (name) {
            case 'attribution':
            case 'collection_repository':
            case 'examination_analysis':
            case 'subject':
            case 'form':
            case 'function':
            case 'catalog':
              this.handleRoutingNotificationForFilterGroups(name, value);
              break;

            case 'page':
              this.handleRoutingNotificationForPage(value);
              break;

            case 'kind':
              this.handleRoutingNotificationForEntityType(value);
              break;

            case 'from_year':
            case 'to_year':
              this.handleRoutingNotificationForDating(name, value);
              break;

            case 'is_best_of':
              this.handleRoutingNotificationForIsBestOf(value);
              break;

            case 'search_term':
            case 'title':
            case 'location':
            case 'inventory_number':
              this.handleRoutingNotificationForFreetext(name, value);
              break;
          }
        });
        break;
    }
  }

  resetAllFilters() {
    this.freetextFields = {
      allFieldsTerm: '',
      title: '',
      FRNr: '',
      location: '',
      inventoryNumber: '',
    };
    
    this.datingRangeBounds = INITIAL_DATING_RANGE_BOUNDS;
    this.filters.dating = {
      fromYear: MIN_LOWER_DATING_YEAR,
      toYear: MAX_UPPER_DATING_YEAR,
    };
    
    this.filters.size = INITIAL_RESULTS_SIZE;
    this.filters.from = INITIAL_RESULTS_FROM;
    this.filters.entityType = INITIAL_ENTITY_TYPE;
    this.filters.filterGroups = INITIAL_FILTER_GROUPS;
    this.filters.isBestOf = INITIAL_IS_BEST_OF;

    this.triggerFilterRequest();
  }

  private updateRoutingForFilterGroups(groupKey: string) {
    const groupSet = this.filters.filterGroups.get(groupKey);
    const routingActions: RoutingSearchQueryParamChange = [];
    const routingAction = !groupSet ? RoutingChangeAction.REMOVE : RoutingChangeAction.ADD;
    const gs = Array.from(this.filters.filterGroups.get(groupKey) || new Set()).join(',');

    routingActions.push([routingAction, [groupKey, gs]]);
    this.rootStore.routing.updateSearchQueryParams(routingActions);
  }

  private handleRoutingNotificationForFilterGroups(name: string, value: string) {
    this.filters.filterGroups.set(name, new Set(value.split(',')));
  }

  private setRoutingForPage() {
    const page = (this.filters.from / this.filters.size) + 1;
    this.rootStore.routing.updateSearchQueryParams([[RoutingChangeAction.ADD, ['page', page.toString()]]]);
  }

  private handleRoutingNotificationForPage(value: string) {
    this.filters.from = Math.max(0, (parseInt(value, 10) - 1) * this.filters.size);
  }

  private setRoutingForEntityType() {
    const kind = this.filters.entityType;
    this.rootStore.routing.updateSearchQueryParams([[RoutingChangeAction.ADD, ['kind', kind]]]);
  }

  private handleRoutingNotificationForEntityType(value: string) {
    if (value in Object.keys(EntityType)){
      this.filters.entityType = value as EntityType;
    }
  }

  private setRoutingForDating() {
    const { fromYear, toYear } = this.filters.dating;

    this.rootStore.routing.updateSearchQueryParams([
      [(fromYear ? RoutingChangeAction.ADD : RoutingChangeAction.REMOVE), ['from_year', fromYear.toString()]],
      [RoutingChangeAction.ADD, ['to_year', toYear <= THRESOLD_UPPER_DATING_YEAR ? toYear.toString() : 'max']],
    ]);
  }

  private setRoutingForFreetextFields() {
    const changeActions: RoutingSearchQueryParamChange = [];

    const keyMap: Record<string, string> = {
      'allFieldsTerm': 'search_term',
      'inventoryNumber': 'inventory_number',
    };

    Object.entries(this.freetextFields).forEach(([key, value]) => {
      changeActions.push([
        value ? RoutingChangeAction.ADD : RoutingChangeAction.REMOVE,
        [(key in keyMap ? keyMap[key]: key), value],
      ]);
    });

    this.rootStore.routing.updateSearchQueryParams(changeActions);
  }

  private handleRoutingNotificationForDating(name: string, value: string) {
    switch (name) {
      case 'from_year':
        this.filters.dating.fromYear = Math.max(
          Math.min(
            parseInt(value, 10),
            this.datingRangeBounds[1],
          ),
          this.datingRangeBounds[0],
        );
        break;

      case 'to_year':
        if (value === 'max') {
          this.filters.dating.toYear = THRESOLD_UPPER_DATING_YEAR + 1;
        } else {
          this.filters.dating.toYear = Math.max(
            Math.min(
              parseInt(value, 10),
              this.datingRangeBounds[1],
            ),
            this.datingRangeBounds[0],
          );
        }
        break;
    }
  }

  private setRoutingForIsBestOf() {
    const action = this.filters.isBestOf ? RoutingChangeAction.ADD : RoutingChangeAction.REMOVE;
    this.rootStore.routing.updateSearchQueryParams([[action, ['is_best_of', '1']]]);
  }


  private handleRoutingNotificationForIsBestOf(value: string) {
    this.filters.isBestOf = (value === '1');
  }

  private handleRoutingNotificationForFreetext(name: string, value: string) {
    switch(name) {
      case 'search_term':
        this.freetextFields.allFieldsTerm = value;
        break;

      case 'title':
        this.freetextFields.title = value;
        break;

      case 'location':
        this.freetextFields.location = value;
        break;

      case 'inventory_number':
        this.freetextFields.inventoryNumber = value;
        break;
    }
  }
}

export interface FreeTextFields {
  allFieldsTerm: string;
  title: string;
  FRNr: string;
  location: string;
  inventoryNumber: string;
}

export interface GlobalSearchStoreInterface {
  freetextFields: FreeTextFields;
  loading: boolean;
  result: GlobalSearchResult | null;
  error: string | null;
  datingRangeBounds: [number, number];
  filters: FilterType;
  debounceWaitInMSecs: number;
  debounceHandler: undefined | number;
  flattenedSearchResultItems: GlobalSearchArtifact[];
  currentResultPagePos: number;
  maxResultPages: number;

  bestOfFilter: SingleFilter | null;

  setFreetextFields(fields: Partial<FreeTextFields>): void;
  setSearchLoading(loading: boolean): void;
  setSearchResult(result: GlobalSearchResult | null): void;
  resetSearchResult(): void;
  setPagination(relativePagePos: number): void;
  jumpToPagePos(pagePos: number): void;
  setSearchFailed(error: string | null): void;
  setDating(fromYear: number, toYear: number): void;
  setEntityType(entityType: EntityType): void;
  setSize(size: number): void;
  setFrom(from: number): void;
  resetFrom(): void;
  setIsBestOf(isBestOf: boolean): void;
  toggleFilterItemActiveStatus(groupKey: string, filterItemId: string): void;
  triggerFilterRequest(): void;
  triggerUserCollectionRequest(ids: string[]): void;
  resetEntityType(): void;
  applyFreetextFields(): void;
  resetAllFilters(): void;

}
