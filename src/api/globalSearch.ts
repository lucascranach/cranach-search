
const querify = (obj: Record<string, string|number>) => Object.entries(obj).map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join('&');

const host = import.meta.env.VITE_SEARCH_API_URL;
const authUser = import.meta.env.VITE_AUTH_USER;
const authPass = import.meta.env.VITE_AUTH_PASS;

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
): Promise<GlobalSearchResults> =>  {
  const params: Record<string, string|number> = {
    // lang, // `lang` parameter is commented out because of current missing support
    size: 30,
    'size_height:gt': 200, // 9000: 2; 8000: 129; 7000: 393
  };

  if (filters.dating.from) {
    params['dating_begin:gte'] = filters.dating.from;
  }

  if (filters.dating.to) {
    params['dating_end:lte'] = filters.dating.to;
  }

  if (filters.entityType !== EntityType.UNKNOWN) {
    params['entity_type:eq'] = filters.entityType;
  }

  const cleanSearchTerm = searchTerm.trim();
  if (cleanSearchTerm !== '') {
    /* Commented out until the free-text search is usable */
    // params['term:eq'] = cleanSearchTerm;
  }

  const authString = btoa(`${authUser}:${authPass}`);
  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + authString);

  return await fetch(
    `${host}/?${querify(params)}`,
    { method: 'GET', headers: headers },
  ).then(resp => resp.json())
  .then((obj: any) => obj.data.results.map(toArtefact))
  .catch((e) => console.error(e));
};

export default {
  async searchByFiltersAndTerm(
    filters: APIFilterType,
    searchTerm: string,
    lang: string,
  ): Promise<GlobalSearchResults> {
    return await searchByFiltersAndTerm(filters, searchTerm, lang);
  }
};

export enum EntityType {
  GRAPHICS = 'GRAPHICS',
  PAINTINGS = 'PAINTINGS',
  DOCUMENTS = 'DOCUMENTS',
  UNKNOWN = 'UNKNOWN',
}

export type APIFilterType = {
  dating: {
    from: string,
    to: string,
  },
  entityType: EntityType,
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

export type GlobalSearchResults = GlobalSearchArtifact[];
