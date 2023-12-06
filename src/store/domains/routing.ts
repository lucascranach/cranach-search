
import type { History, Listener, Update } from 'history'
import { makeObservable, observable, action, computed } from 'mobx';
import { Action } from 'history'
import { RootStoreInterface } from '../rootStore';

export default class Routing implements RoutingStoreInterface {
  rootStore: RootStoreInterface;
  history: History;
  disableNotify: boolean = false;
  routingObservers: ObserverInterface[] = [];
  initialized: boolean = false;

  public state: Update = {
    action: Action.Pop,
    location: {
      key: 'default',
      pathname: '',
      search: '',
      state: {},
      hash: '',
    },
  }

  constructor(rootStore: RootStoreInterface, history: History) {
    makeObservable(this, {
        state: observable,
        updateState: action,
        searchParams: computed,
        updateSearchQueryParams: action,
    });

    this.rootStore = rootStore;
    this.history = history;
  }

  /* Computed */

  get searchParams(): URLSearchParams {
    return new URLSearchParams(this.state.location.search);
  }

  get pathParams(): [string, string][] {
    const [lang = ''] = this.state.location.pathname.split('/').filter((seg) => !!seg);

    return [['lang', lang]];
  }

  /* Actions */

  init() {  
    this.updateState({
      action: this.history.action,
      location: this.history.location,
    }, true);

    
    this.history.listen(this.updateState.bind(this));
    
    this.initialized = true;

    if (this.rootStore.routing.history.location.search.includes('loadLatestSearchConfiguration=true')) {
      const lastParams = this.loadSearchQueryParamsFromLocalStorage();
      const changes: SearchQueryParamChange = lastParams.split('&').map(pair => [ChangeAction.ADD, [pair.split('=')[0], pair.split('=')[1]]]);
      this.rootStore.routing.resetSearchQueryParams();
      if(lastParams) this.rootStore.routing.updateSearchQueryParams(changes);
    }
  }

  loadSearchQueryParamsFromLocalStorage() {
    const rawItem = window.localStorage.getItem('searchQueryParams');
    if(!rawItem) return '';
    return rawItem;
  }

  updateState(newState: Update, initial: boolean = false) {
    if (newState.location.search !== this.state.location.search) {
      const searchParams = Array.from((new URLSearchParams(newState.location.search)).entries());
      this.notifyAllObservers({
        type: initial ? NotificationType.SEARCH_INIT : NotificationType.SEARCH_CHANGE,
        params: searchParams,
      });
    }

    if (newState.location.pathname !== this.state.location.pathname) {
      const [lang = ''] = newState.location.pathname.split('/').filter((seg) => !!seg);

      this.notifyAllObservers({
        type: initial ? NotificationType.PATH_INIT : NotificationType.PATH_CHANGE,
        params: [['lang', lang]],
      })
    }

    this.state = {
      action: newState.action,
      location: { ...newState.location },
    };
  }

  addObserver(observer: ObserverInterface) {
    this.routingObservers.push(observer);

    this.notifyObserverWithCurrentSearchParams(observer);
    this.notifyObserverWithCurrentPathParams(observer);
  }

  updateLanguageParam(langCode: string) {
    if (!this.initialized) return;

    this.disableNotify = true;

    const pathnameSegments = this.state.location.pathname.split('/').filter(seg => !!seg);

    if (pathnameSegments[0] === 'search') pathnameSegments[1] = 'search';
    pathnameSegments[0] = langCode;

    this.history.replace({
      pathname: `/${pathnameSegments.join('/')}/`,
      search: Array.from(this.searchParams).length ? `?${this.searchParams.toString()}` : '',
    });
    this.disableNotify = false;
    document.querySelector('html')?.setAttribute('lang', langCode)
  }

  updateSearchQueryParams(change: SearchQueryParamChange) {
    if (!this.initialized) return;

    const currentSearchParams = this.searchParams;
    const updatedSearchParams = change.reduce((acc, [action, [name, value] = ['', '']]) => {
      switch (action) {
        case ChangeAction.ADD:
          acc.set(name, value);
          break;

        case ChangeAction.REMOVE:
          acc.delete(name);
          break;
      }

      return acc;
    }, currentSearchParams)

    this.disableNotify = true;
    this.history.replace({
      search: Array.from(updatedSearchParams).length ? `?${decodeURI(updatedSearchParams.toString())}` : '',
    });
    this.storeQueryParamsInLocalStorage();
    this.disableNotify = false;
  }

  resetSearchQueryParams() {
    if (!this.initialized) return;

    const emptySearchParams = new URLSearchParams();

    this.disableNotify = true;
    this.history.replace({
      search: Array.from(emptySearchParams).length ? `?${emptySearchParams.toString()}` : '',
    });
    this.storeQueryParamsInLocalStorage();
    this.disableNotify = false;
  }

  notifyObserverWithCurrentSearchParams(observer: ObserverInterface) {
    const { searchParams } = this;

    const params = Array.from(searchParams.entries());

    if (params.length === 0) {
      return;
    }

    observer.notify({
      type: NotificationType.SEARCH_INIT,
      params: params,
    });
  }

  notifyObserverWithCurrentPathParams(observer: ObserverInterface) {
    const { pathParams } = this;

    if (pathParams.length === 0) {
      return;
    }

    observer.notify({
      type: NotificationType.PATH_INIT,
      params: pathParams,
    });
  }

  notifyAllObservers(notification: NotificationInterface) {
    if (this.disableNotify) return;

    this.routingObservers.forEach(observer => observer.notify(notification));
  }

  private storeQueryParamsInLocalStorage(): void {
      localStorage.setItem('searchQueryParams', this.history.location.search.slice(1));
  }
}

export interface RoutingStoreInterface {
  history: History;

  init: () => void;
  addObserver: (observer: ObserverInterface) => void;
  updateLanguageParam: (langCode: string) => void;
  updateSearchQueryParams: (change: SearchQueryParamChange) => void;
  resetSearchQueryParams: () => void;
}

export enum NotificationType {
  SEARCH_INIT = 'SEARCH_INIT',
  SEARCH_CHANGE = 'SEARCH_CHANGE',
  PATH_INIT = 'PATH_INIT',
  PATH_CHANGE = 'PATH_CHANGE',
}

export enum ChangeAction {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}

export type SearchQueryParamChange = [ChangeAction, [string, string]?][];

export interface NotificationInterface {
  type: NotificationType,
  params: [string, string][],
}

export interface ObserverInterface {
  notify: (notification: NotificationInterface) => void;
}
