
import { makeAutoObservable } from 'mobx';
import type { RootStoreInterface } from '../rootStore';
import ArchivalsSearchAPI_ from '../../api/archivals';
import { ArtifactKind, GlobalSearchResult } from '../../api/types';
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

type ArchivalsSearchAPI = typeof ArchivalsSearchAPI_;

interface SearchArchivalsFilters {
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
};

const createInitialFreeTexts = (): FreeTextFields => ({
  allFieldsTerm: '',
});

const createInitialFilters = (): FilterType => ({
  dating: {
    fromYear: MIN_LOWER_DATING_YEAR,
    toYear: MAX_UPPER_DATING_YEAR,
  },
  filterGroups: new Map(),
});


export default class SearchArchivals implements SearchArchivalsStoreInterface, RoutingObservableInterface, LighttableProviderInterface {
  rootStore: RootStoreInterface;
  lighttable: LighttableStoreInterface;
  archivalsSearchAPI: ArchivalsSearchAPI;

  datingRangeBounds: [number, number] = DATING_RANGE_TOTAL_BOUNDS;
  freetextFields: FreeTextFields = createInitialFreeTexts();
  selectedFilters: FilterType = createInitialFilters();
  filters: SearchArchivalsFilters = {
    groups: [],
    flatGroups: [],
    single: [],
  };

  constructor(rootStore: RootStoreInterface, archivalsSearchAPI: ArchivalsSearchAPI) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
    this.lighttable = rootStore.lighttable;
    this.archivalsSearchAPI = archivalsSearchAPI;

    this.rootStore.routing.addObserver(this);
    // SearchWorks is a lightable provider (pushes search results to the lighttable);
    //  we need to register it as a provider in lighttable, so lighttable can decide
    //  which store is responsible for a certain artifact and can provide search results
    //  for that kind
    this.lighttable.registerProvider(this);
  }

  /* Computed */

  get amountOfActiveFilters() {
    const curr = this.selectedFilters;
    const init = createInitialFilters();

    const datingChanged = curr.dating.fromYear !== init.dating.fromYear
      || curr.dating.toYear !== init.dating.toYear;

    const filterGroupsChanged = curr.filterGroups.size !== init.filterGroups.size;

    return [
      datingChanged,
      filterGroupsChanged,
    ].filter((item) => item).length;
  }

  /* Actions */

  setFreetextFields(fields: Partial<FreeTextFields>) {
    this.freetextFields = {
      ...this.freetextFields,
      ...fields,
    };
  }

  setFilters(filters: SearchArchivalsFilters) {
    this.filters = filters;
  }

  applyFreetextFields() {
    this.updateRoutingForFreetextFields();
  }

  storeSearchResultInLocalStorage(result: GlobalSearchResult | null) {
    if (result === null) return;

    const artefactIds = result.items.map(item => {
      const { id } = item;
      const pattern = `.*${id}`;
      const imgSrc = 'imgSrc' in item ? item.imgSrc.replace(pattern, id) : '';
      const entityType = Array.from(this.rootStore.lighttable.entityTypes).join(',');
      return { id, imgSrc, entityType, }
    });

    const artefactIdsJson = JSON.stringify(artefactIds);

    localStorage.setItem('searchResult', artefactIdsJson);
  }

  setDating(fromYear: number, toYear: number) {
    this.selectedFilters.dating.fromYear = fromYear;
    this.selectedFilters.dating.toYear = toYear;
    this.updateRoutingForDating();
    this.lighttable.fetch();
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
    this.lighttable.fetch();
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

    const response = await this.archivalsSearchAPI.searchByFilters(
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
    const supportedArtifactKinds = new Set([LighttableArtifactKind.ARCHIVALS]);

    return supportedArtifactKinds.has(artifactKind);
  }

  private async triggerExtendedFilterRequestForLocalStorage(filters: FilterType, lang: string): Promise<void> {
    const extendedFilters = {
      ...filters,
      size: this.lighttable.pagination.size * 2,
      from: this.lighttable.pagination.from,
      entityTypes: this.rootStore.lighttable.entityTypes,
    };
    const responseForInArtefactNavigation = await this.archivalsSearchAPI.searchByFilters(
      extendedFilters,
      this.freetextFields,
      lang,
    );
    this.lighttable.storeSearchResultInLocalStorage('searchResult:archivals', responseForInArtefactNavigation?.result ?? null);
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

            case 'search_term':
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
    this.lighttable.fetch();
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


  private handleRoutingNotificationForFreetext(name: string, value: string) {
    switch(name) {
      case 'search_term':
        this.freetextFields.allFieldsTerm = value;
        break;
    }
  }

  private updateAllFilterRoutings() {
    this.updateRoutingForDating();
    this.updateRoutingForFilterGroups();
  }
}

export interface FreeTextFields {
  allFieldsTerm: string;
}

export interface SearchArchivalsStoreInterface {
  datingRangeBounds: [number, number];
  freetextFields: FreeTextFields
  selectedFilters: FilterType;
  filters: SearchArchivalsFilters;
  amountOfActiveFilters: number;

  setFreetextFields(fields: Partial<FreeTextFields>): void;
  applyFreetextFields(): void;
  setDating(fromYear: number, toYear: number): void;
  checkFilterItemActiveStatus(groupKey: string, filterItemId: string): void;
  toggleFilterItemActiveStatus(groupKey: string, filterItemId: string): void;
  triggerFilterRequest(): void;
  resetAllFilters(): void;
}
