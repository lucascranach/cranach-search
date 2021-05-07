
const querify = (obj: Record<string, string|number>) => Object.entries(obj).map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join('&');

const host = import.meta.env.VITE_SEARCH_API_URL;
const authUser = import.meta.env.VITE_AUTH_USER;
const authPass = import.meta.env.VITE_AUTH_PASS;

const toArtefact = (item: any) => {
  const { _data_all: d } = item;

  return {
    id: d.inventoryNumber,
    langCode: d.langCode,
    title: d.titles[0].title,
    subtitle: '',
    date: '',
    additionalInfoList: [],
    classification: '',
    imgSrc: d.images ? d.images.representative.variants[0].s.src : '',
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
    'entity_type:eq': 'PAINTING', /* TODO: remove after all other entity types are supported */
  };

  if (filters.dating.from) {
    params['dating_begin:gte'] = filters.dating.from;
  }

  if (filters.dating.to) {
    params['dating_end:lte'] = filters.dating.to;
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

export type APIFilterType = {
  dating: {
    from: string,
    to: string,
  },
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
