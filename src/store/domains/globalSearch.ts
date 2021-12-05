
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

const THRESOLD_UPPER_DATING_YEAR = 1600;

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
  datingRangeBounds: [number, number] = [1500, 1600];
  filters: FilterType = {
    dating: {
      fromYear: 1500,
      toYear: 1600,
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

  setDating(fromYear: number, toYear: number) {
    this.filters.dating.fromYear = fromYear;
    this.filters.dating.toYear = toYear;
    this.setRoutingForDating();
    this.triggerFilterRequest();
  }

  setFrom(from: number) {
    this.filters.from = from;
    this.setRoutingForPage();
    this.triggerFilterRequest();
  }

  setIsBestOf(isBestOf: boolean) {
    this.filters.isBestOf = isBestOf;
    this.setRoutingForIsBestOf();
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

    this.updateRoutingForFilterGroups(groupKey);
    this.triggerFilterRequest();
  }

  setEntityType(entityType: EntityType) {
    this.filters.entityType = entityType;
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

  private setRoutingForIsBestOf() {
    const action = this.filters.isBestOf ? RoutingChangeAction.ADD : RoutingChangeAction.REMOVE;
    this.rootStore.routing.updateSearchQueryParams([[action, ['is_best_of', '1']]]);
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

  private handleRoutingNotificationForIsBestOf(value: string) {
    this.filters.isBestOf = (value === '1');
  }
}

export interface GlobalSearchStoreInterface {
  allFieldsTerm: string;
  loading: boolean;
  result: GlobalSearchResult | null;
  error: string | null;
  datingRangeBounds: [number, number];
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
  setDating(fromYear: number, toYear: number): void;
  setEntityType(entityType: EntityType): void;
  setFrom(from: number): void;
  setIsBestOf(isBestOf: boolean): void;
  toggleFilterItemActiveStatus(groupKey: string, filterItemId: string): void;
  triggerFilterRequest(): void;
  triggerUserCollectionRequest(ids: string[]): void;
  resetEntityType(): void;

}
