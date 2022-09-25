
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
export { EntityType } from '../../api/globalSearch';
export type {
  GlobalSearchFilterGroupItem as FilterGroupItem,
  GlobalSearchFilterItem as FilterItem,
} from '../../api/globalSearch';

type GlobalSearchAPI = typeof GlobalSearchAPI_;


export default class Lighttable implements LighttableStoreInterface, RoutingObservableInterface {
  rootStore: RootStoreInterface;
  globalSearchAPI: GlobalSearchAPI;

  loading: boolean = false;
  result: GlobalSearchResult | null = null;
  error: string | null = null;
  pagination = {
    size: 60,
    from: 0,
  };
  entityType: EntityType = EntityType.UNKNOWN;

  constructor(rootStore: RootStoreInterface, globalSearchAPI: GlobalSearchAPI) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
    this.globalSearchAPI = globalSearchAPI;
    this.rootStore.routing.addObserver(this);
  }

  /* Computed */

  get flattenedResultItem(): GlobalSearchArtifact[] {
    return this.result?.items ?? [];
  }

  get currentResultPagePos(): number {
    return this.pagination.from / this.pagination.size;
  }

  get maxResultPages(): number {
    const hits = this.result?.meta.hits ?? 0;

    return Math.ceil(hits / this.pagination.size);
  }

  get artefactMode(): ArtefactMode {
    switch (this.entityType) {
      case EntityType.PAINTINGS:
      case EntityType.GRAPHICS:
      case EntityType.UNKNOWN:
        return ArtefactMode.WORKS;

      case EntityType.ARCHIVALS:
        return ArtefactMode.ARCHIVALS;
    }

    return ArtefactMode.WORKS;
  }

  /* Actions */

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

  setSize(size: number) {
    if (this.pagination.size === size) return;

    this.pagination.size = size;
  }

  setFrom(from: number) {
    this.pagination.from = from;
  }

  setPagination(relativePagePos: number) {
    if (relativePagePos === 0) return;

    const pagePos = (this.pagination.from + (this.pagination.size * relativePagePos)) / this.pagination.size;

    this.updatePagePos(pagePos);
  }

  jumpToPagePos(pagePos: number) {
    this.updatePagePos(pagePos);
  }

  notify(notification: RoutingNotificationInterface) {
    switch (notification.type) {
      case RoutingNotificationType.SEARCH_INIT:
      case RoutingNotificationType.SEARCH_CHANGE:
        notification.params.forEach(([name, value]) => {
          switch (name) {
            case 'page':
              this.handleRoutingNotificationForPage(value);
              break;
          }
        });
        break;
    }
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

  resetPagePos() {
    this.updatePagePos(0);
  }

  private updateRoutingForPage() {
    const page = (this.pagination.from / this.pagination.size) + 1;
    const action = (page !== 0) ? RoutingChangeAction.ADD : RoutingChangeAction.REMOVE;
    this.rootStore.routing.updateSearchQueryParams([[action, ['page', page.toString()]]]);
  }

  private handleRoutingNotificationForPage(value: string) {
    this.pagination.from = Math.max(0, (parseInt(value, 10) - 1) * this.pagination.size);
  }

  private updatePagePos(pagePos: number) {
    const gatedPagePos = Math.max(0, pagePos);

    this.setFrom(gatedPagePos * this.pagination.size);
    this.updateRoutingForPage();
  }

}

export enum ArtefactMode {
  WORKS = 'works',
  ARCHIVALS = 'archivals',
}

export interface LighttableStoreInterface {
  loading: boolean;
  result: GlobalSearchResult | null;
  error: string | null;
  pagination: {
    size: number;
    from: number;
  };
  entityType: EntityType;
  flattenedResultItem: GlobalSearchArtifact[];
  currentResultPagePos: number;
  maxResultPages: number;

  artefactMode: ArtefactMode;

  setSearchLoading(loading: boolean): void;
  setSearchResult(result: GlobalSearchResult | null): void;
  resetSearchResult(): void;
  setPagination(relativePagePos: number): void;
  jumpToPagePos(pagePos: number): void;
  setSearchFailed(error: string | null): void;
  setSize(size: number): void;
  setFrom(from: number): void;
  resetPagePos(): void;
  storeSearchResultInLocalStorage(result: GlobalSearchResult | null): void;
}
