
const querify = (obj: Record<string, string | number>) => Object.entries(obj).map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join('&');

const host = import.meta.env.VITE_SEARCH_API_URL;
const authUser = import.meta.env.VITE_AUTH_USER;
const authPass = import.meta.env.VITE_AUTH_PASS;


const assembleResultData = (resultset: any): GlobalSearchResult => {
  const items = resultset.data.results.map((item: any) => toArtefact(item));
  const filters = resultset.data.filters.filterInfos;
  const meta = resultset.data.meta;
  return { items, filters, meta };
}

const setHistory = (queryParams: string) => {
  const baseurl = location.protocol + '//' + location.host + location.pathname;
  const nextState = { searchParams: queryParams };
  const nextTitle = "cda_ // Search ";
  const nextURL = `${baseurl}?${queryParams}`;
  window.history.pushState(nextState, nextTitle, nextURL);
}

const getInventor = (item: any):string => {
  const inventor = item.data_all.involvedPersons.find((person: any) => person.role === 'Inventor');
  return inventor ? `${inventor.name}${inventor.suffix}` : '';
}

const getArtist = (item: any):string => {
  const artist = item.data_all.involvedPersons.find((person: any) => person.role === 'Künstler');
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
    printProcess: item.data_all.classification.printProcess ? item.data_all.classification.printProcess : '',
    inventor: getInventor(item),
    artist: getArtist(item),
    dimensions: item.data_all.dimensions,
    objectName: item.object_name,
    imgSrc: item.images ? item.images.overall.images[0].small.src : '',
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

  if (filters.filterInfos.size > 0) {
    params['filterInfos:eq'] = Array.from(filters.filterInfos).join(',');
  }

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
  filterInfos: Set<string>,
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

export type GlobalSearchFilterInfoItem = {
  id: string;
  text: string;
  doc_count: number;
  is_available: boolean;
  children: GlobalSearchFilterInfoItem[];
}

export type GlobalSearchResult = {
  items: GlobalSearchArtifact[];
  filters: GlobalSearchFilterInfoItem[];
  meta: {
    hits: number;
  };
}
