
const querify = (obj: Record<string, string | number>) => Object.entries(obj).map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join('&');

const host = import.meta.env.VITE_SEARCH_API_URL;
const authUser = import.meta.env.VITE_AUTH_USER;
const authPass = import.meta.env.VITE_AUTH_PASS;

/* Temporary helper function */
const cleanThesaurusItem = (item: any): GlobalSearchThesaurusItem => {
  return {
    id: item.alt.dkultTermIdentifier,
    name: item.term,
    count: item.doc_count,
    is_available: item.is_available,
    children: item.subTerms.map(cleanThesaurusItem),
  }
}

const assembleResultData = (resultset: any): GlobalSearchResult => {
  const items = resultset.data.results.map((item: any) => toArtefact(item));
  const filters = {
    thesaurus: resultset.data.filters.thesaurus.map(cleanThesaurusItem),
  };
  const meta = resultset.data.meta;
  return { items, filters, meta };
}

const setHistory = (queryParams: string) => {
  const baseurl = location.protocol + '//' + location.host + location.pathname;
  const nextState = {searchParams: queryParams};
  const nextTitle = "cda_ // Search ";
  const nextURL = `${baseurl}?${queryParams}`;
  window.history.pushState(nextState, nextTitle, nextURL);
}

const toArtefact = (item: any) => {
  const { _data_all: d } = item;

  return {
    id: item.id,
    langCode: d.langCode,
    title: d.titles[0].title,
    subtitle: '',
    date: '',
    additionalInfoList: [],
    classification: '',
    imgSrc: item.images ? item.images.overall.images[0].small.src : '',
  };
};

const searchByFiltersAndTerm = async (
  filters: APIFilterType,
  searchTerm: string,
  lang: string
): Promise<GlobalSearchResult | null> => {
  const params: Record<string, string | number> = {
    // lang, // `lang` parameter is commented out because of current missing support
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

  if (filters.entityType !== EntityType.UNKNOWN) {
    params['entity_type:eq'] = filters.entityType;
  }

  if (filters.thesaurus.size > 0) {
    params['thesaurus:eq'] = Array.from(filters.thesaurus).join(',');
  }

  const cleanSearchTerm = searchTerm.trim();
  if (cleanSearchTerm !== '') {
    /* Commented out until the free-text search is usable */
    // params['term:eq'] = cleanSearchTerm;
  }

  const authString = btoa(`${authUser}:${authPass}`);
  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + authString);

  const queryParams = querify(params);
  setHistory(queryParams);

  try {
    const resp = await fetch(
      `${host}/?${querify(params)}`,
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
  }
};

export enum EntityType {
  GRAPHICS = 'GRAPHIC',
  PAINTINGS = 'PAINTING',
  DOCUMENTS = 'DOCUMENT',
  UNKNOWN = 'UNKNOWN',
  COLLECTION = 'COLLECTION'
}


export type APIFilterType = {
  dating: {
    from: string,
    to: string,
  },
  size: number,
  from: number,
  entityType: EntityType,
  thesaurus: Set<string>,
};

export type GlobalSearchArtifact = {
  id: string;
  langCode: string;
  title: string;
  subtitle: string;
  date: string;
  additionalInfoList: string[];
  classification: string;
  imgSrc: string;
}

export type GlobalSearchThesaurusItem = {
  id: string;
  name: string;
  count: number;
  is_available: boolean;
  children: GlobalSearchThesaurusItem[];
}

export type GlobalSearchFilters = {
  thesaurus: GlobalSearchThesaurusItem[];
}

export type GlobalSearchResult = {
  items: GlobalSearchArtifact[];
  filters: GlobalSearchFilters;
  meta: {
    hits: number;
  };
}
