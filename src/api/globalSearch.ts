
const querify = (obj: Record<string, string | number>) => Object.entries(obj).map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join('&');

const host = import.meta.env.VITE_SEARCH_API_URL;
const authUser = import.meta.env.VITE_AUTH_USER;
const authPass = import.meta.env.VITE_AUTH_PASS;

const mapFilterGroups = (filters: any): GlobalSearchFilterGroupItem[] => {
  return [
    'attribution',
    'collection_repository',
    'examination_analysis',
    'subject',
    'form',
    'function',
  ].map((filterGroupKey) => ({
    key: filterGroupKey,
    text: filters[filterGroupKey].display_value,
    children: filters[filterGroupKey].values,
  }));
}

const assembleResultData = (resultset: any): GlobalSearchResult => {
  const items = resultset.data.results.map((item: any) => toArtefact(item));
  const filterGroups = mapFilterGroups(resultset.data.filters);
  const meta = resultset.data.meta;
  return { items, filterGroups, meta };
}

const setHistory = (queryParams: string) => {
  const baseurl = location.protocol + '//' + location.host + location.pathname;
  const nextState = {searchParams: queryParams};
  const nextTitle = "cda_ // Search ";
  const nextURL = `${baseurl}?${queryParams}`;
  window.history.pushState(nextState, nextTitle, nextURL);
}

const toArtefact = (item: any): GlobalSearchArtifact => ({
  id: item.inventory_number,
  entityType: item.entity_type,
  title: item.title,
  subtitle: item.owner,
  date: '',
  additionalInfoList: [],
  classification: '',
  objectName: item.object_name,
  imgSrc: item.images ? item.images.overall.images[0].small.src : '',
  entityTypeShortcut: item.entity_type.substr(0,1),
});



const searchByFiltersAndTerm = async (
  filters: APIFilterType,
  searchTerm: string,
  langCode: string
): Promise<GlobalSearchResult | null> => {
  const params: Record<string, string | number> = {
    language: langCode,
    'size_height:gt': 200, // 9000: 2; 8000: 129; 7000: 393
  };

  if (filters.size) {
    params['size'] = filters.size;
  }

  if (filters.from) {
    params['from'] = filters.from;
  }

  if (filters.dating.from) {
    params['dating_begin:gte'] = filters.dating.from;
  }

  if (filters.dating.to) {
    params['dating_end:lte'] = filters.dating.to;
  }

  if (filters.id) {
    params['inventory_number:eq'] = filters.id;
  }

  if (filters.entityType !== EntityType.UNKNOWN) {
    params['entity_type:eq'] = filters.entityType;
  }

  filters.filterGroups.forEach((filterIds: Set<string>, groupKey: string) => {
    params[`${groupKey}:eq`] = Array.from(filterIds).join(',');
  });

  const cleanSearchTerm = searchTerm.trim();
  if (cleanSearchTerm !== '') {
    /* Commented out until the free-text search is usable */
    // params['term:eq'] = cleanSearchTerm;
  }

  const queryParams = querify(params);

  try {
    return await executeQuery(queryParams);
  } catch(err) {
    console.error(err);
  }

  return null;
};

const retrieveUserCollection = async (
  ids: string[],
  langCode: string
): Promise<GlobalSearchResult | null> => {

  const params: Record<string, string | number> = {
    language: langCode,
    'inventory_number:eq': ids.join(','),
  };

  const queryParams = querify(params);

  try {
    return await executeQuery(queryParams);
  } catch(err) {
    console.error(err);
  }

  return null;
};

const executeQuery = async (
  queryParams: string
): Promise<GlobalSearchResult | null> => {

  const authString = btoa(`${authUser}:${authPass}`);
  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + authString);

  setHistory(queryParams);

  try {
    const resp = await fetch(
      `${host}/?${queryParams}`,
      { method: 'GET', headers: headers },
    );
    const bodyJSON = await resp.json();
    return assembleResultData(bodyJSON);
  } catch(err) {
    console.error(err);
  }

  return null;
};


export default {
  async searchByFiltersAndTerm(
    filters: APIFilterType,
    searchTerm: string,
    lang: string,
  ): Promise<GlobalSearchResult | null> {
    return await searchByFiltersAndTerm(filters, searchTerm, lang);
  },
  async retrieveUserCollection(
    ids: string[],
    lang: string,
  ): Promise<GlobalSearchResult | null> {
    return await retrieveUserCollection(ids, lang);
  }
};

export enum EntityType {
  GRAPHICS = 'GRAPHIC',
  PAINTINGS = 'PAINTING',
  DOCUMENTS = 'DOCUMENT',
  UNKNOWN = 'UNKNOWN'
}

export enum EntityTypeShortcuts {
  GRAPHICS = 'G',
  PAINTINGS = 'P',
  DOCUMENTS = 'D',
  UNKNOWN = 'U'
}

export type APIFilterType = {
  dating: {
    from: string,
    to: string,
  },
  size: number,
  from: number,
  entityType: EntityType,
  id: string
  filterGroups: Map<string, Set<string>>,
};

export type GlobalSearchArtifact = {
  id: string;
  objectName: string;
  entityType: EntityType,
  title: string;
  subtitle: string;
  date: string;
  additionalInfoList: string[];
  classification: string;
  imgSrc: string;
  entityTypeShortcut: string;
}

export type GlobalSearchFilterItem = {
  id: string;
  text: string;
  doc_count: number;
  is_available: boolean;
  children: GlobalSearchFilterItem[];
}

export type GlobalSearchFilterGroupItem = {
  key: string,
  text: string;
  children: GlobalSearchFilterItem[];
}

export type GlobalSearchResult = {
  items: GlobalSearchArtifact[];
  filterGroups: GlobalSearchFilterGroupItem[];
  meta: {
    hits: number;
  };
}
