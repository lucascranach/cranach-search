
import type { History, Listener, Update } from 'history'
import { makeObservable, observable, action, computed } from 'mobx';
import { Action } from 'history'
import { RootStoreInterface } from '../rootStore';

export default class Routing implements RoutingStoreInterface {
  rootStore: RootStoreInterface;
  history: History;
  disableNotify: boolean = false;
  routingObservers: ObserverInterface[] = [];

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

    history.listen(this.updateState.bind(this));

    this.updateState({
      action: history.action,
      location: history.location,
    });
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

  updateState(newState: Update) {
    if (newState.location.search !== this.state.location.search) {
      const searchParams = Array.from((new URLSearchParams(newState.location.search)).entries());

      this.notifyAllObservers({
        type: NotificationType.SEARCH_CHANGE,
        params: searchParams,
      });
    }

    if (newState.location.pathname !== this.state.location.pathname) {
      const [lang = ''] = newState.location.pathname.split('/').filter((seg) => !!seg);

      this.notifyAllObservers({
        type: NotificationType.PATH_CHANGE,
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
    this.disableNotify = true;
    this.history.replace({
      pathname: `/${langCode}/`,
      search: Array.from(this.searchParams).length ? `?${this.searchParams.toString()}` : '',
    });
    this.disableNotify = false;
  }

  updateSearchQueryParams(change: SearchQueryParamChange) {
    const currentSearchParams = this.searchParams;

    const updatedSearchParams = change.reduce((acc, [action, [name, value]]) => {
      switch (action) {
        case ChangeAction.ADD:
          currentSearchParams.set(name, value);
          break;

        case ChangeAction.REMOVE:
          currentSearchParams.delete(name);
          break;
      }

      return acc;
    }, currentSearchParams)

    this.disableNotify = true;
    this.history.replace({
      search: Array.from(updatedSearchParams).length ? `?${updatedSearchParams.toString()}` : '',
    });
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
    if (this.disableNotify) { return; }

    this.routingObservers.forEach(observer => observer.notify(notification));
  }
}

export interface RoutingStoreInterface {
  history: History;

  addObserver: (observer: ObserverInterface) => void;
  updateLanguageParam: (langCode: string) => void;
  updateSearchQueryParams: (change: SearchQueryParamChange) => void;
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

export type SearchQueryParamChange = [ChangeAction, [string, string]][];

export interface NotificationInterface {
  type: NotificationType,
  params: [string, string][],
}

export interface ObserverInterface {
  notify: (notification: NotificationInterface) => void;
}
