
import { reaction, makeAutoObservable } from 'mobx';
import type { RootStoreInterface } from '../rootStore';
import GlobalSearchAPI_, {
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
import { LighttableStoreInterface } from './lighttable';

const MIN_LOWER_DATING_YEAR = 1470;
const MAX_UPPER_DATING_YEAR = 1601;
const THRESOLD_UPPER_DATING_YEAR = 1600;

type GlobalSearchAPI = typeof GlobalSearchAPI_;

export const DATING_RANGE_TOTAL_BOUNDS: [number, number] = [MIN_LOWER_DATING_YEAR, THRESOLD_UPPER_DATING_YEAR];

export type FilterType = {
  dating: {
    fromYear: number,
    toYear: number,
  },
  entityType: EntityType,
  filterGroups: Map<string, Set<string>>,
  isBestOf: boolean,
};

export type SingleFilter = {
  id: string,
  name: string,
  docCount: number,
}

const createInitialFreeTexts = (): FreeTextFields => ({
  allFieldsTerm: '',
  title: '',
  FRNr: '',
  location: '',
  inventoryNumber: '',
});

const createInitialFilters = (): FilterType => ({
  dating: {
    fromYear: MIN_LOWER_DATING_YEAR,
    toYear: MAX_UPPER_DATING_YEAR,
  },
  entityType: EntityType.UNKNOWN,
  filterGroups: new Map(),
  isBestOf: false,
});


export default class SearchWorks implements SearchWorksStoreInterface, RoutingObservableInterface {
  rootStore: RootStoreInterface;
  lighttable: LighttableStoreInterface;
  globalSearchAPI: GlobalSearchAPI;

  datingRangeBounds: [number, number] = DATING_RANGE_TOTAL_BOUNDS;
  freetextFields: FreeTextFields = createInitialFreeTexts();
  filters: FilterType = createInitialFilters();

  debounceWaitInMSecs: number = 500;
  debounceHandler: undefined | number = undefined;

  constructor(rootStore: RootStoreInterface, globalSearchAPI: GlobalSearchAPI) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
    this.lighttable = rootStore.lighttable;
    this.globalSearchAPI = globalSearchAPI;
    this.rootStore.routing.addObserver(this);

    reaction(
      () => this.rootStore.ui.lang,
      () => this.triggerFilterRequest(),
    );
  }

  /* Computed */

  get bestOfFilter(): SingleFilter | null {
    const isBestOfFilter = this.lighttable.result?.singleFilters.find((item) => item.id === 'is_best_of');

    if (!isBestOfFilter) { return null; }

    return {
      name: 'Best of',
      id: isBestOfFilter.id,
      docCount: isBestOfFilter.doc_count,
    };
  }


  get amountOfActiveFilters() {
    const curr = this.filters;
    const init = createInitialFilters();

    const datingChanged = curr.dating.fromYear !== init.dating.fromYear
      || curr.dating.toYear !== init.dating.toYear;

    // TODO: const sizeChanged = curr.size !== init.size;
    // TODO: const fromChanged = curr.from !== init.from;
    const entityTypeChanged = curr.entityType !== init.entityType;
    const filterGroupsChanged = curr.filterGroups.size !== init.filterGroups.size;
    const isBestOfChanged = curr.isBestOf !== init.isBestOf;

    return [
      datingChanged,
      // TODO: sizeChanged,
      // TODO: fromChanged,
      entityTypeChanged,
      filterGroupsChanged,
      isBestOfChanged,
    ].filter((item) => item).length;
  }

  /* Actions */

  setFreetextFields(fields: Partial<FreeTextFields>) {
    this.freetextFields = {
      ...this.freetextFields,
      ...fields,
    };
  }

  applyFreetextFields() {
    this.updateRoutingForFreetextFields();
  }

  storeSearchResultInLocalStorage(result: GlobalSearchResult | null) {
    if (result === null) return;

    const artefactIds = result.items.map(item => {
      const { id } = item;
      const { entityType } = item;
      const pattern = `.*${id}`;
      const imgSrc = item.imgSrc.replace(pattern, id);
      return { id, imgSrc, entityType }
    });

    const artefactIdsJson = JSON.stringify(artefactIds);

    localStorage.setItem('searchResult', artefactIdsJson);
  }

  setDating(fromYear: number, toYear: number) {
    this.filters.dating.fromYear = fromYear;
    this.filters.dating.toYear = toYear;
    this.updateRoutingForDating();
    this.triggerFilterRequest();
  }

  setSize(size: number) {
    this.lighttable.setSize(size);

    this.triggerFilterRequest();
  }

  setFrom(from: number) {
    this.lighttable.setFrom(from);
  }

  setIsBestOf(isBestOf: boolean) {
    this.filters.isBestOf = isBestOf;
    this.updateRoutingForIsBestOf();
    this.triggerFilterRequest();
  }

  checkFilterItemActiveStatus(groupKey: string, filterItemId: string) {
    const groupSet = this.filters.filterGroups.get(groupKey);

    return !!groupSet && groupSet.has(filterItemId);
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

    this.updateRoutingForFilterGroups();
    this.triggerFilterRequest();
  }

  setEntityType(entityType: EntityType) {
    this.filters.entityType = entityType;
    this.updateRoutingForEntityType();
    this.triggerFilterRequest();
  }

  resetEntityType() {
    this.filters.entityType = EntityType.UNKNOWN;
  }

  triggerFilterRequest(resetPagePos: boolean = true) {
    clearTimeout(this.debounceHandler);

    this.debounceHandler = window.setTimeout(async () => {
      const { lang } = this.rootStore.ui;
      this.lighttable.setResultLoading(true);

      if (resetPagePos) {
        this.lighttable.resetPagePos();
      }

      try {
        const updatedFilters = {
          ...this.filters,
          dating: {
            ...this.filters.dating,
            /* resetting dating.toYear, if it is over the upper threshold -> we want all results between dating.fromYear and now */
            toYear: (this.filters.dating.toYear <= THRESOLD_UPPER_DATING_YEAR) ? this.filters.dating.toYear : 0,
          },
          size: this.lighttable.pagination.size,
          from: this.lighttable.pagination.from,
        };
        const result = await this.globalSearchAPI.searchByFiltersAndTerm(
          updatedFilters,
          this.freetextFields,
          lang,
        );
        this.lighttable.setResult(result);

        this.triggerExtendedFilterRequestForLocalStorage(updatedFilters, lang);
      } catch(err: any) {
        this.lighttable.setResultFetchingFailed(err.toString());
      } finally {
        this.lighttable.setResultLoading(false);
      }
    }, this.debounceWaitInMSecs);
  }

  private async triggerExtendedFilterRequestForLocalStorage(filters: FilterType, lang: string): Promise<void> {
    const extendedFilters = {
      ...filters,
      size: this.lighttable.pagination.size * 2,
      from: this.lighttable.pagination.from,
    };
    const resultForInAcrtefactNavigation = await this.globalSearchAPI.searchByFiltersAndTerm(
      extendedFilters,
      this.freetextFields,
      lang,
    );
    this.lighttable.storeSearchResultInLocalStorage(resultForInAcrtefactNavigation);
  }

  triggerUserCollectionRequest(ids: string[]) {

    (async () => {
      const { lang } = this.rootStore.ui;
      this.lighttable.setResultLoading(true);
      try {
        const result = await this.globalSearchAPI.retrieveUserCollection(
          ids,
          lang,
        );
        this.lighttable.setResult(result);
      } catch(err: any) {
        this.lighttable.setResultFetchingFailed(err.toString());
      } finally {
        this.lighttable.setResultLoading(false);
      }
    })();
  }

  notify(notification: RoutingNotificationInterface) {
    switch (notification.type) {
      case RoutingNotificationType.SEARCH_INIT:
      case RoutingNotificationType.SEARCH_CHANGE:
        notification.params.forEach(([name, value]) => {
          switch (name) {
            case 'filters':
              this.handleRoutingNotificationForFilterGroups(value);
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
    this.datingRangeBounds = DATING_RANGE_TOTAL_BOUNDS;
    this.filters = createInitialFilters();

    this.updateAllFilterRoutings();
    this.triggerFilterRequest();
  }

  private updateRoutingForFilterGroups() {
    const routingActions: RoutingSearchQueryParamChange = [];

    if (this.filters.filterGroups.size === 0) {
      routingActions.push([RoutingChangeAction.REMOVE, ['filters', '']]);
    }

    const payload = Array.from(this.filters.filterGroups.entries()).reduce<string[]>((acc, [groupKey, _]) => {
      const stringifiedGroupValue = Array.from(this.filters.filterGroups.get(groupKey) || new Set()).join(',');
      return acc.concat([`${groupKey}:${stringifiedGroupValue}`]);
    }, []);

    if (payload.length > 0) {
      routingActions.push([RoutingChangeAction.ADD, ['filters', payload.join(';')]]);
    }

    this.rootStore.routing.updateSearchQueryParams(routingActions);
  }

  private handleRoutingNotificationForFilterGroups(value: string) {
    value.split(';').forEach((groupStr) => {
      const [groupKey, filterIds = ''] = groupStr.split(':').map(item => item.trim());

      if (filterIds.length > 0) {
        this.filters.filterGroups.set(groupKey, new Set(filterIds.split(',')));
      }
    });
  }

  private updateRoutingForEntityType() {
    const kind = this.filters.entityType;
    this.rootStore.routing.updateSearchQueryParams([[RoutingChangeAction.ADD, ['kind', kind]]]);
  }

  private handleRoutingNotificationForEntityType(value: string) {
    if (Object.values(EntityType).includes(value as EntityType)) {
      this.filters.entityType = value as EntityType;
    }
  }

  private updateRoutingForDating() {
    const { fromYear, toYear } = this.filters.dating;

    this.rootStore.routing.updateSearchQueryParams([
      [(fromYear ? RoutingChangeAction.ADD : RoutingChangeAction.REMOVE), ['from_year', fromYear.toString()]],
      [RoutingChangeAction.ADD, ['to_year', toYear <= THRESOLD_UPPER_DATING_YEAR ? toYear.toString() : 'max']],
    ]);
  }

  private updateRoutingForFreetextFields() {
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
            DATING_RANGE_TOTAL_BOUNDS[1],
          ),
          DATING_RANGE_TOTAL_BOUNDS[0],
        );
        break;

      case 'to_year':
        if (value === 'max') {
          this.filters.dating.toYear = THRESOLD_UPPER_DATING_YEAR + 1;
        } else {
          this.filters.dating.toYear = Math.max(
            Math.min(
              parseInt(value, 10),
              DATING_RANGE_TOTAL_BOUNDS[1],
            ),
            DATING_RANGE_TOTAL_BOUNDS[0],
          );
        }
        break;
    }
  }

  private updateRoutingForIsBestOf() {
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

  private updateAllFilterRoutings() {
    this.updateRoutingForEntityType();
    this.updateRoutingForDating();
    this.updateRoutingForIsBestOf();
    this.updateRoutingForFilterGroups();
  }
}

export interface FreeTextFields {
  allFieldsTerm: string;
  title: string;
  FRNr: string;
  location: string;
  inventoryNumber: string;
}

export interface SearchWorksStoreInterface {
  datingRangeBounds: [number, number];
  freetextFields: FreeTextFields;
  filters: FilterType;
  debounceWaitInMSecs: number;
  debounceHandler: undefined | number;
  amountOfActiveFilters: number;

  bestOfFilter: SingleFilter | null;

  setFreetextFields(fields: Partial<FreeTextFields>): void;
  setDating(fromYear: number, toYear: number): void;
  setEntityType(entityType: EntityType): void;
  setSize(size: number): void;
  setFrom(from: number): void;
  setIsBestOf(isBestOf: boolean): void;
  toggleFilterItemActiveStatus(groupKey: string, filterItemId: string): void;
  triggerFilterRequest(resetPagePos?: boolean): void;
  triggerUserCollectionRequest(ids: string[]): void;
  resetEntityType(): void;
  applyFreetextFields(): void;
  resetAllFilters(): void;
}
