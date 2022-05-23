
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
    'function',
    'form',
    'component_parts',
    'subject',
    'technique',
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

const getInventor = (item: any):string => {
  const inventor = item.involved_persons.find((person: any) => person.roleType === 'INVENTOR');
  return inventor ? `${inventor.name}${inventor.suffix}` : '';
}

const getArtist = (item: any):string => {
  const artist = item.involved_persons.find((person: any) => person.roleType === 'ARTIST');
  return artist ? artist.name : '';
}

const getMedium = (item: any):string => {
  const medium = item.medium;
  const mediumList = medium.split(/\n/);
  return medium ? mediumList[0] : '';
}

const toArtefact = (item: any): GlobalSearchArtifact => {
  return {
    id: item.inventory_number,
    entityType: item.entity_type,
    title: item.title,
    date: item.dating,
    repository: item.repository,
    owner: item.owner,
    classification: item.classification,
    printProcess: item.print_process,
    inventor: getInventor(item),
    artist: getArtist(item),
    dimensions: item.dimensions,
    objectName: item.object_name,
    imgSrc: item.img_src,
    medium: getMedium(item),
    _highlight: item._highlight,
  }
};

const getQueryStringForFiltersAndTerm = (
  filters: APIFilterType,
  freetextFields: APIFreetextFieldsType,
  langCode: string
): string => {
  const params: Record<string, string | number> = {
    language: langCode,
    'entity_type:neq': EntityType.DOCUMENTS,
    'size_height:gt': 200, // 9000: 2; 8000: 129; 7000: 393
  };

  if (filters.size) {
    params['size'] = filters.size;
  }

  if (filters.from) {
    params['from'] = filters.from;
  }

  if (filters.dating.fromYear) {
    params['dating_begin:gte'] = filters.dating.fromYear;
  }

  if (filters.dating.toYear) {
    params['dating_end:lte'] = filters.dating.toYear;
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

  const cleanAllFieldsTerm = freetextFields.allFieldsTerm.trim();
  if (cleanAllFieldsTerm !== '') {
    params['searchterm'] = cleanAllFieldsTerm;
  }

  const cleanTitle = freetextFields.title.trim();
  if (cleanTitle) {
    params['title:sim'] = cleanTitle;
  }

  const cleanFRNr = freetextFields.FRNr.trim();
  if (cleanFRNr) {
    params['object_name:sim'] = cleanFRNr;
  }

  const cleanLocation = freetextFields.location.trim();
  if (cleanLocation) {
    params['locations:sim'] = cleanLocation;
  }

  const cleanInventoryNumber = freetextFields.inventoryNumber.trim();
  if (cleanInventoryNumber) {
    params['inventory_number:sim'] = cleanInventoryNumber;
  }

  return querify(params);
};

const searchByFiltersAndTerm = async (
  filters: APIFilterType,
  freetextFields: APIFreetextFieldsType,
  langCode: string
): Promise<GlobalSearchResult | null> => {
  const queryParams = getQueryStringForFiltersAndTerm(
    filters,
    freetextFields,
    langCode,
  );

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
  getQueryStringForFiltersAndTerm,
  searchByFiltersAndTerm,
  retrieveUserCollection,
};

export enum EntityType {
  GRAPHICS = 'GRAPHIC',
  PAINTINGS = 'PAINTING',
  DOCUMENTS = 'DOCUMENT',
  ARCHIVALS = 'ARCHIVAL',
  UNKNOWN = 'UNKNOWN',
}

export type APIFilterType = {
  dating: {
    fromYear: number,
    toYear: number,
  },
  size: number,
  from: number,
  entityType: EntityType,
  filterGroups: Map<string, Set<string>>,
  isBestOf: boolean,
};

export type APIFreetextFieldsType = {
  allFieldsTerm: string,
  title: string,
  FRNr: string,
  location: string,
  inventoryNumber: string,
};

export type GlobalSearchArtifact = {
  id: string;
  objectName: string;
  entityType: EntityType,
  title: string;
  inventor: string;
  artist: string;
  repository: string;
  owner: string;
  date: string;
  dimensions: string;
  classification: string;
  printProcess: string;
  imgSrc: string;
  medium: string;
  _highlight?: Record<string, Array<string>>;
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
