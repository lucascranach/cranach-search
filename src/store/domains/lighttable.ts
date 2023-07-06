
import { makeAutoObservable } from 'mobx';
import type { RootStoreInterface } from '../rootStore';
import {
  EntityType,
  GlobalSearchArtifact,
  GlobalSearchResult,
  SortingDirection,
  SortingItem,
} from '../../api/types';
export { EntityType } from '../../api/types';
export type {
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
} from './routing';
import { UIArtifactKind as LighttableArtifactKind } from './ui';
export { UIArtifactKind as LighttableArtifactKind } from './ui';

const initialSorting: SortingItem[] = [
  // Literature is by default sorted by referenceNumber (ascending), so we should indicate that initially
  { fieldName: 'referenceNumber', direction: 'asc'},
];

export default class Lighttable implements LighttableStoreInterface, RoutingObservableInterface {
  rootStore: RootStoreInterface;
  providers: LighttableProviderInterface[] = [];

  loading: boolean = false;
  result: GlobalSearchResult | null = null;
  error: string | null = null;
  pagination = {
    size: 60,
    from: 0,
  };
  sorting: SortingItem[] = initialSorting;

  fetchDebounceWaitInMSecs: number = 500;
  fetchDebounceHandler: undefined | number = undefined;

  loadingStateActivationDelayInMSecs: number = 50;

  constructor(rootStore: RootStoreInterface) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
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

  get entityTypes(): Set<EntityType> {
    const artifactKindToEntityTypeMap: Record<LighttableArtifactKind, EntityType[]> = {
      [LighttableArtifactKind.WORKS]: [EntityType.PAINTING, EntityType.GRAPHIC],
      [LighttableArtifactKind.PAINTINGS]: [EntityType.PAINTING],
      [LighttableArtifactKind.ARCHIVALS]: [EntityType.ARCHIVAL],
    };

    const { artifactKind } = this.rootStore.ui;

    const mappedEntityTypes = artifactKind in artifactKindToEntityTypeMap
      ? artifactKindToEntityTypeMap[artifactKind]
      : [EntityType.UNKNOWN];

    return new Set(mappedEntityTypes);
  }

  get currentProvider(): LighttableProviderInterface | null {
    return this.providers.find(
      (provider) => provider.supportsArtifactKind(this.rootStore.ui.artifactKind),
    ) || null;
  }


  /* Actions */

  fetch() {
    // The first provider matching the currently selected artifact kind,
    // is used to request search results for that kind of artifact
    const { currentProvider } = this;

    if (!currentProvider) {
      return;
    }

    clearTimeout(this.fetchDebounceHandler);
    this.fetchDebounceHandler = undefined;

    this.fetchDebounceHandler = window.setTimeout(async () => {
      const loadingIndicatorTimeoutHandler = window.setTimeout(() => {
        this.setResultLoading(true);
      }, this.loadingStateActivationDelayInMSecs);

      try {
        // The provider is starts the request and is also the one setting
        // the results directly in the lighttable store via a 'setResult'-call;
        // a provider is always able to set the result, because of filters
        // being selected triggering a new search
        await currentProvider.triggerRequest();
      } catch(err: any) {
        this.setResultFetchingFailed(err.toString());
      } finally {
        clearTimeout(loadingIndicatorTimeoutHandler);
        this.setResultLoading(false);
      }
    }, this.fetchDebounceWaitInMSecs);
  }

  reset() {
    this.resetPagePos();
    this.resetSorting();
  }

  registerProvider(provider: LighttableProviderInterface) {
    this.providers.push(provider);
  }

  setResultLoading(loading: boolean) {
    this.loading = loading;
  }

  setResult(result: GlobalSearchResult | null) {
    this.result = result;
  }

  resetResult() {
    this.result = null;
  }

  setResultFetchingFailed(error: string | null) {
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

            case 'sort':
              this.handleRoutingNotificationForSort(value);
              break;
          }
        });
        break;
    }
  }

  storeSearchResultInLocalStorage(key: string, result: GlobalSearchResult | null) {
    if (result === null) return;

    const artefactIds = result.items.map(item => {
      const { id } = item;
      const { entityType } = item;
      const pattern = `.*${id}`;
      const imgSrc = 'imgSrc' in item ? item.imgSrc.replace(pattern, id) : '';
      return { id, imgSrc, entityType }
    });

    const artefactIdsJson = JSON.stringify(artefactIds);

    localStorage.setItem(key, artefactIdsJson);
  }

  resetPagePos() {
    this.updatePagePos(0);
  }

  setSortingForFieldname(fieldName: string, direction: SortingDirection | null) {
    this.sorting = (direction !== null) ? [{ fieldName, direction }] : [];

    this.updateRoutingForSorting();
    this.fetch();
  }

  getSortingForFieldname(fieldName: string): SortingDirection | null {
    const foundExistingSortingField = this.sorting.find((currSortingField) => currSortingField.fieldName === fieldName);

    if (foundExistingSortingField) return foundExistingSortingField.direction;

    return null;
  }

  resetSorting() {
    this.sorting = initialSorting;
  }

  private updateRoutingForPage() {
    const page = this.currentResultPagePos + 1;
    this.rootStore.routing.updateSearchQueryParams([[RoutingChangeAction.ADD, ['page', page.toString()]]]);
  }

  private handleRoutingNotificationForPage(value: string) {
    this.pagination.from = Math.max(0, (parseInt(value, 10) - 1) * this.pagination.size);
  }

  private updatePagePos(pagePos: number) {
    const gatedPagePos = Math.max(0, pagePos);

    this.setFrom(gatedPagePos * this.pagination.size);
    this.updateRoutingForPage();
  }

  private updateRoutingForSorting() {
    const sortValue = this.sorting.map(({fieldName, direction}) => `${fieldName}:${direction}`).join(',');
    if (this.sorting.length > 0) {
      this.rootStore.routing.updateSearchQueryParams([
        [RoutingChangeAction.ADD, [ 'sort', sortValue ]],
      ]);
    } else {
      this.rootStore.routing.updateSearchQueryParams([
        [RoutingChangeAction.REMOVE, [ 'sort', '']],
      ]);
    }
  }

  private handleRoutingNotificationForSort(value: string) {
    this.sorting = value.split(',').reduce<SortingItem[]>((acc, singleValue) => {
      const [fieldName = '', direction = ''] = singleValue.split(':');
      const cleanFieldName = fieldName.trim();
      const cleanDirection = direction.trim();

      if (cleanFieldName.length > 0 && ['asc', 'desc'].includes(cleanDirection)) {
        acc.push({
          fieldName: cleanFieldName,
          direction: cleanDirection as SortingDirection,
        });
      }

      return acc;
    }, []);
  }
}

export interface LighttableProviderInterface {
  triggerRequest(): Promise<void>;

  supportsArtifactKind(artifactKind: LighttableArtifactKind): boolean;
  resetAllFilters(): void;
}

export interface LighttableStoreInterface {
  loading: boolean;
  result: GlobalSearchResult | null;
  error: string | null;
  pagination: {
    size: number;
    from: number;
  };
  sorting: SortingItem[];
  flattenedResultItem: GlobalSearchArtifact[];
  currentResultPagePos: number;
  maxResultPages: number;
  entityTypes: Set<EntityType>;
  currentProvider: LighttableProviderInterface | null;

  fetch(): void;
  reset(): void;
  registerProvider(provider: LighttableProviderInterface): void;
  setResultLoading(loading: boolean): void;
  setResult(result: GlobalSearchResult | null): void;
  resetResult(): void;
  setPagination(relativePagePos: number): void;
  jumpToPagePos(pagePos: number): void;
  setResultFetchingFailed(error: string | null): void;
  setSize(size: number): void;
  setFrom(from: number): void;
  resetPagePos(): void;
  setSortingForFieldname(fieldName: string, direction: SortingDirection | null): void;
  getSortingForFieldname(fieldName: string): SortingDirection | null;
  resetSorting(): void;
  storeSearchResultInLocalStorage(key: string, result: GlobalSearchResult | null): void;
}
