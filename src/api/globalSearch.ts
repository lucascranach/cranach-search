
const querify = (obj: Record<string, string | number>) => Object.entries(obj).map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join('&');

const host = import.meta.env.VITE_SEARCH_API_URL;
const authUser = import.meta.env.VITE_AUTH_USER;
const authPass = import.meta.env.VITE_AUTH_PASS;

const mapFilterGroups = (filters: any): GlobalSearchFilterGroupItem[] => {
  return [
    'catalog',
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

const mapSingleFilters = (filters: any): GlobalSearchFilterItem[] => {
  const singleFilters: GlobalSearchFilterItem[] = [];

  if (filters['is_best_of']) {
    const value = filters['is_best_of'].values[1];

    singleFilters.push({
      id: 'is_best_of',
      text: value.display_value,
      doc_count: value.doc_count,
      is_available: value.is_available,
      children: [],
    });
  }

  return singleFilters;
}

const assembleResultData = (resultset: any): GlobalSearchResult => {
  const items = resultset.data.results.map((item: any) => toArtefact(item));
  const filterGroups = mapFilterGroups(resultset.data.filters);
  const singleFilters = mapSingleFilters(resultset.data.filters);
  const meta = resultset.data.meta;
  return { items, filterGroups, singleFilters, meta };
}

const setHistory = (queryParams: string) => {
  const baseurl = location.protocol + '//' + location.host + location.pathname;
  const nextState = { searchParams: queryParams };
  const nextTitle = "cda_ // Search ";
  const nextURL = `${baseurl}?${queryParams}`;
  window.history.pushState(nextState, nextTitle, nextURL);
}

const getInventor = (item: any):string => {
  const inventor = item.involved_persons.find((person: any) => person.roleType === 'INVENTOR');
  return inventor ? `${inventor.name}${inventor.suffix}` : '';
}

const getArtist = (item: any):string => {
  const artist = item.involved_persons.find((person: any) => person.roleType === 'ARTIST');
  return artist ? artist.name : '';
}

const toArtefact = (item: any): GlobalSearchArtifact => {
  return {
    id: item.inventory_number,
    entityType: item.entity_type,
    title: item.title,
    date: item.dating,
    owner: item.owner,
    classification: item.classification,
    printProcess: item.print_process,
    inventor: getInventor(item),
    artist: getArtist(item),
    dimensions: item.dimensions,
    objectName: item.object_name,
    imgSrc: item.img_src,
    entityTypeShortcut: item.entity_type.substr(0, 1),
  }
};

const searchByFiltersAndTerm = async (
  filters: APIFilterType,
  searchTerm: string,
  langCode: string
): Promise<GlobalSearchResult | null> => {
  const params: Record<string, string | number> = {
    language: langCode,
    sort_by: 'sorting_number.asc',
    'entity_type:neq': EntityType.DOCUMENTS,
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

  if (filters.isBestOf) {
    params['is_best_of'] = 'true';
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
  ARCHIVALS = 'ARCHIVAL',
  UNKNOWN = 'UNKNOWN'
}

export enum EntityTypeShortcuts {
  GRAPHICS = 'G',
  PAINTINGS = 'P',
  DOCUMENTS = 'D',
  ARCHIVALS = 'A',
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
  isBestOf: boolean,
};

export type GlobalSearchArtifact = {
  id: string;
  objectName: string;
  entityType: EntityType,
  title: string;
  inventor: string;
  artist: string;
  owner: string;
  date: string;
  dimensions: string;
  classification: string;
  printProcess: string;
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
  singleFilters: GlobalSearchFilterItem[];
  meta: {
    hits: number;
  };
}
