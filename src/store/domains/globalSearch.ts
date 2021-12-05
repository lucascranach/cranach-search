
import { makeAutoObservable } from 'mobx';
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
  allFieldsTerm: string = '';
  loading: boolean = false;
  result: GlobalSearchResult | null = null;
  error: string | null = null;
  filters: FilterType = {
    dating: {
      fromYear: 0,
      toYear: 0,
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

  constructor(rootStore: RootStoreInterface, globalSearchAPI: GlobalSearchAPI) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
    this.globalSearchAPI = globalSearchAPI;
    this.rootStore.routing.addObserver(this);
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
    this.resetFrom();
    this.triggerFilterRequest();
  }

  setDatingFrom(fromYear: number) {
    this.filters.dating.fromYear = fromYear;
    this.resetFrom();
    this.setRoutingForDating();
    this.triggerFilterRequest();
  }

  setDatingTo(toYear: number) {
    this.filters.dating.toYear = toYear;
    this.resetFrom();
    this.setRoutingForDating();
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
          }
        });
        break;
    }
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
      [(toYear ? RoutingChangeAction.ADD : RoutingChangeAction.REMOVE), ['to_year', toYear.toString()]],
    ]);
  }

  private handleRoutingNotificationForDating(name: string, value: string) {
    switch (name) {
      case 'from_year':
        this.filters.dating.fromYear = parseInt(value, 10);
        break;

      case 'to_year':
        this.filters.dating.toYear = parseInt(value, 10);
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
  currentResultPagePos: number;
  maxResultPages: number;

  bestOfFilter: SingleFilter | null;

  setAllFieldsTerm(allFieldsTerm: string): void;
  setSearchLoading(loading: boolean): void;
  setSearchResult(result: GlobalSearchResult | null): void;
  resetSearchResult(): void;
  setPagination(relativePagePos: number): void;
  jumpToPagePos(pagePos: number): void;
  setSearchFailed(error: string | null): void;
  searchForAllFieldsTerm(allFieldsTerm: string): void;
  setDatingFrom(fromYear: number): void;
  setDatingTo(toYear: number): void;
  setEntityType(entityType: EntityType): void;
  setFrom(from: number): void;
  resetFrom(): void;
  setIsBestOf(isBestOf: boolean): void;
  toggleFilterItemActiveStatus(groupKey: string, filterItemId: string): void;
  triggerFilterRequest(): void;
  triggerUserCollectionRequest(ids: string[]): void;
  resetEntityType(): void;

}
