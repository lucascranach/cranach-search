
import { makeAutoObservable } from 'mobx';
import type { RootStoreInterface } from '../rootStore';
import WorksSearchAPI_ from '../../api/works';
import type {
  GlobalSearchFilterGroupItem as FilterGroupItem,
  GlobalSearchFilterItem as FilterItem,
} from '../../api/types';
import type {
  ObserverInterface as RoutingObservableInterface,
  NotificationInterface as RoutingNotificationInterface,
} from './routing';
import {
  NotificationType as RoutingNotificationType,
  ChangeAction as RoutingChangeAction,
  SearchQueryParamChange as RoutingSearchQueryParamChange,
} from './routing';
import {
  LighttableStoreInterface,
  LighttableProviderInterface,
  LighttableArtifactKind,
} from './lighttable';

const MIN_LOWER_DATING_YEAR = 1470;
const MAX_UPPER_DATING_YEAR = 1601;
const THRESOLD_UPPER_DATING_YEAR = 1600;

type WorksSearchAPI = typeof WorksSearchAPI_;

interface SearchWorksFilters {
  groups: FilterGroupItem[];
  flatGroups: FilterGroupItem[];
  single: FilterItem[];
}

export const DATING_RANGE_TOTAL_BOUNDS: [number, number] = [MIN_LOWER_DATING_YEAR, THRESOLD_UPPER_DATING_YEAR];

export type FilterType = {
  dating: {
    fromYear: number,
    toYear: number,
  },
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
  filterGroups: new Map(),
  isBestOf: false,
});


export default class SearchWorks implements SearchWorksStoreInterface, RoutingObservableInterface, LighttableProviderInterface {
  rootStore: RootStoreInterface;
  lighttable: LighttableStoreInterface;
  worksSearchAPI: WorksSearchAPI;

  datingRangeBounds: [number, number] = DATING_RANGE_TOTAL_BOUNDS;
  freetextFields: FreeTextFields = createInitialFreeTexts();
  selectedFilters: FilterType = createInitialFilters();
  filters: SearchWorksFilters = {
    groups: [],
    flatGroups: [],
    single: [],
  };

  constructor(rootStore: RootStoreInterface, worksSearchAPI: WorksSearchAPI) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
    this.lighttable = rootStore.lighttable;
    this.worksSearchAPI = worksSearchAPI;

    this.rootStore.routing.addObserver(this);
    // SearchWorks is a lightable provider (pushes search results to the lighttable);
    //  we need to register it as a provider in lighttable, so lighttable can decide
    //  which store is responsible for a certain artifact and can provide search results
    //  for that kind
    this.lighttable.registerProvider(this);
  }

  /* Computed */

  get bestOfFilter(): SingleFilter | null {
    const isBestOfFilter = this.filters.single.find((item) => item.id === 'is_best_of');

    if (!isBestOfFilter) { return null; }

    return {
      name: 'Best of',
      id: isBestOfFilter.id,
      docCount: isBestOfFilter.doc_count,
    };
  }

  get amountOfActiveFilters() {
    const curr = this.selectedFilters;
    const init = createInitialFilters();

    const datingChanged = curr.dating.fromYear !== init.dating.fromYear
      || curr.dating.toYear !== init.dating.toYear;

    const filterGroupsChanged = curr.filterGroups.size !== init.filterGroups.size;
    const isBestOfChanged = curr.isBestOf !== init.isBestOf;

    return [
      datingChanged,
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

  setDating(fromYear: number, toYear: number) {
    this.selectedFilters.dating.fromYear = fromYear;
    this.selectedFilters.dating.toYear = toYear;
    this.updateRoutingForDating();
    this.lighttable.fetch();
  }

  setIsBestOf(isBestOf: boolean) {
    this.selectedFilters.isBestOf = isBestOf;
    this.updateRoutingForIsBestOf();
  }

  setFilters(filters: SearchWorksFilters) {
    this.filters = filters;
  }

  checkFilterItemActiveStatus(groupKey: string, filterItemId: string) {
    const groupSet = this.selectedFilters.filterGroups.get(groupKey);

    return !!groupSet && groupSet.has(filterItemId);
  }

  toggleFilterItemActiveStatus(groupKey: string, filterItemId: string) {
    const groupSet = this.selectedFilters.filterGroups.get(groupKey);

    if (groupSet) {
      if (groupSet.has(filterItemId)) {
        groupSet.delete(filterItemId);
      } else {
        groupSet.add(filterItemId);
      }

      if (groupSet.size === 0) {
        this.selectedFilters.filterGroups.delete(groupKey);
      }
    } else {
      this.selectedFilters.filterGroups.set(groupKey, new Set([filterItemId]));
    }

    this.updateRoutingForFilterGroups();
  }

  async triggerFilterRequest() {
    const { lang } = this.rootStore.ui;

    const updatedFilters = {
      ...this.selectedFilters,
      dating: {
        ...this.selectedFilters.dating,
        /* resetting dating.toYear, if it is over the upper threshold -> we want all results between dating.fromYear and now */
        toYear: (this.selectedFilters.dating.toYear <= THRESOLD_UPPER_DATING_YEAR) ? this.selectedFilters.dating.toYear : 0,
      },
      size: this.lighttable.pagination.size,
      from: this.lighttable.pagination.from,
      entityTypes: this.rootStore.lighttable.entityTypes,
    };

    const response = await this.worksSearchAPI.searchByFiltersAndTerm(
      updatedFilters,
      this.freetextFields,
      lang,
    )

    if (response) {
      this.lighttable.setResult(response.result);
      this.setFilters(response.filters);
    }
    this.triggerExtendedFilterRequestForLocalStorage(updatedFilters, lang);
  }

  async triggerRequest(): Promise<void> {
      return this.triggerFilterRequest();
  }

  supportsArtifactKind(artifactKind: LighttableArtifactKind) {
    const supportedArtifactKinds = new Set([LighttableArtifactKind.WORKS, LighttableArtifactKind.PAINTINGS]);

    return supportedArtifactKinds.has(artifactKind);
  }

  private async triggerExtendedFilterRequestForLocalStorage(filters: FilterType, lang: string): Promise<void> {
    const extendedFilters = {
      ...filters,
      size: this.lighttable.pagination.size * 2,
      from: this.lighttable.pagination.from,
      entityTypes: this.rootStore.lighttable.entityTypes,
    };
    const responseForInArtefactNavigation = await this.worksSearchAPI.searchByFiltersAndTerm(
      extendedFilters,
      this.freetextFields,
      lang,
    );
    this.lighttable.storeSearchResultInLocalStorage('searchResult', responseForInArtefactNavigation?.result ?? null);
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
    this.selectedFilters = createInitialFilters();

    this.updateAllFilterRoutings();
  }

  private updateRoutingForFilterGroups() {
    const routingActions: RoutingSearchQueryParamChange = [];

    if (this.selectedFilters.filterGroups.size === 0) {
      routingActions.push([RoutingChangeAction.REMOVE, ['filters', '']]);
    }

    const payload = Array.from(this.selectedFilters.filterGroups.entries()).reduce<string[]>((acc, [groupKey, _]) => {
      const stringifiedGroupValue = Array.from(this.selectedFilters.filterGroups.get(groupKey) || new Set()).join(',');
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
        this.selectedFilters.filterGroups.set(groupKey, new Set(filterIds.split(',')));
      }
    });
  }

  private updateRoutingForDating() {
    const { fromYear, toYear } = this.selectedFilters.dating;

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
        this.selectedFilters.dating.fromYear = Math.max(
          Math.min(
            parseInt(value, 10),
            DATING_RANGE_TOTAL_BOUNDS[1],
          ),
          DATING_RANGE_TOTAL_BOUNDS[0],
        );
        break;

      case 'to_year':
        if (value === 'max') {
          this.selectedFilters.dating.toYear = THRESOLD_UPPER_DATING_YEAR + 1;
        } else {
          this.selectedFilters.dating.toYear = Math.max(
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
    const action = this.selectedFilters.isBestOf ? RoutingChangeAction.ADD : RoutingChangeAction.REMOVE;
    this.rootStore.routing.updateSearchQueryParams([[action, ['is_best_of', '1']]]);
  }


  private handleRoutingNotificationForIsBestOf(value: string) {
    this.selectedFilters.isBestOf = (value === '1');
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
  selectedFilters: FilterType;
  filters: SearchWorksFilters;
  amountOfActiveFilters: number;

  bestOfFilter: SingleFilter | null;

  setFreetextFields(fields: Partial<FreeTextFields>): void;
  setDating(fromYear: number, toYear: number): void;
  setIsBestOf(isBestOf: boolean): void;
  toggleFilterItemActiveStatus(groupKey: string, filterItemId: string): void;
  triggerFilterRequest(): void;
  applyFreetextFields(): void;
  resetAllFilters(): void;
}
