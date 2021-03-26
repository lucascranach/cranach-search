
import { makeAutoObservable } from 'mobx';
import UI from './ui';
import { GlobalSearchAPIInterface, GlobalSearchArtifact, GlobalSearchResult } from '../../api/globalSearch';

export default class GlobalSearch implements GlobalSearchStoreInterface {
  uiStore: UI;

  globalSearchAPI: GlobalSearchAPIInterface;

  allFieldsTerm: string = '';

  loading: boolean = false;

  results: GlobalSearchResult = {
    graphics: [],
    paintings: [],
    archivals: [],
  };

  error: string | null = null;

  constructor(uiStore: UI, globalSearchAPI: GlobalSearchAPIInterface) {
    makeAutoObservable(this);

    this.uiStore = uiStore;
    this.globalSearchAPI = globalSearchAPI;
  }


  /* Computed */

  get flattenedSearchResultItems(): GlobalSearchArtifact[] {
    const { graphics, paintings, archivals } = this.results;
    return [...graphics, ...paintings, ...archivals];
  }


  /* Actions */

  setAllFieldsTerm(allFieldsTerm: string) {
    this.allFieldsTerm = allFieldsTerm;
  }

  setSearchLoading(loading: boolean) {
    this.loading = loading;
  }

  setSearchResults(results: GlobalSearchResult) {
    this.results = results;
  }

  resetSearchResults() {
    this.results = {
      graphics: [],
      paintings: [],
      archivals: [],
    };
  }

  setSearchFailed(error: string | null) {
    this.error = error;
  }

  searchForAllFieldsTerm(allFieldsTerm: string) {
    const { lang } = this.uiStore;

    this.setAllFieldsTerm(allFieldsTerm);

    if (allFieldsTerm.trim() === '') {
      this.resetSearchResults();
      return;
    }

    this.setSearchLoading(true);

    this.globalSearchAPI.searchGloballyFor(allFieldsTerm, lang).then(
      (results: GlobalSearchResult) => this.setSearchResults(results),
      err => this.setSearchFailed(err.toString()),
    ).finally(
      () => this.setSearchLoading(false),
    );
  }
}

export interface GlobalSearchStoreInterface {
  allFieldsTerm: string;

  loading: boolean;

  results: GlobalSearchResult;

  error: string | null;

  flattenedSearchResultItems: GlobalSearchArtifact[];

  setAllFieldsTerm(allFieldsTerm: string): void;

  setSearchLoading(loading: boolean): void;

  setSearchResults(results: GlobalSearchResult): void;

  resetSearchResults(): void;

  setSearchFailed(error: string | null): void;

  searchForAllFieldsTerm(allFieldsTerm: string): void;
}
