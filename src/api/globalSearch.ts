
const querify = (obj: Record<string, string|number>) => Object.entries(obj).map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join('&');

const searchByFiltersAndTerm = (filters: APIFilterType, searchTerm: string, lang: string) => {
  const params: Record<string, string|number> = {
    lang,
    size: 100,
  };

  if (filters.dating.from) {
    params['dating_begin:gte'] = filters.dating.from;
  }

  if (filters.dating.to) {
    params['dating_end:lte'] = filters.dating.to;
  }

  const cleanSearchTerm = searchTerm.trim();
  if (cleanSearchTerm !== '') {
    params['term:eq'] = cleanSearchTerm;
  }

  return fetch(
    `http://localhost:3001/?${querify(params)}`,
  ).then(resp => resp.json());
};

export default {
  searchByFiltersAndTerm(filters: APIFilterType, searchTerm: string, lang: string): Promise<GlobalSearchResult> {
    return searchByFiltersAndTerm(filters, searchTerm, lang);
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

export type GlobalSearchResult = {
  graphics: GlobalSearchArtifact[];
  paintings: GlobalSearchArtifact[];
  archivals: GlobalSearchArtifact[];
}
