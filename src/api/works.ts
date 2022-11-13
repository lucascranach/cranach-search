import {
  EntityType,
  GlobalSearchFilterGroupItem,
  GlobalSearchFilterItem,
  GlobalSearchArtifact,
  GlobalSearchResponse,
} from './types';

import {
  querify,
  apiConfiguration,
} from './utils';

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

const assembleResultData = (resultset: any): GlobalSearchResponse => {
  const items = resultset.data.results.map((item: any) => toArtefact(item));
  const filterGroups = mapFilterGroups(resultset.data.filters);
  const singleFilters = mapSingleFilters(resultset.data.filters);
  const meta = resultset.data.meta;
  return {
    result: { items, meta },
    filters: {
      groups: filterGroups,
      flatGroups: [],
      single: singleFilters,
    },
  };
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

const getQueryStringForFiltersAndTerm = (
  filters: WorksAPIFilterType,
  freetextFields: WorksAPIFreetextFieldsType,
  langCode: string
): string => {
  const params: Record<string, string | number> = {
    language: langCode,
  };

  if (import.meta.env.VITE_LIST_ARTEFACTS_WITHOUT_IMAGES === 'false') {
    params['size_height:gt'] = 200; // 9000: 2; 8000: 129; 7000: 393
  }

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

  if (!filters.entityTypes.has(EntityType.UNKNOWN)) {
    params['entity_type:eq'] = Array.from(filters.entityTypes).join(',');
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
  filters: WorksAPIFilterType,
  freetextFields: WorksAPIFreetextFieldsType,
  langCode: string
): Promise<GlobalSearchResponse | null> => {
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

const executeQuery = async (
  queryParams: string
): Promise<GlobalSearchResponse | null> => {
  const { host, authUser, authPass } = apiConfiguration;
  const authString = btoa(`${authUser}:${authPass}`);
  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + authString);

  try {
    const resp = await fetch(
      `${host}/works?${queryParams}`,
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
};

export const toArtefact = (item: any): GlobalSearchArtifact => {
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
    searchSortingNumber: item.search_sorting_number,
    _highlight: item._highlight,
  }
};

export type WorksAPIFilterType = {
  dating: {
    fromYear: number,
    toYear: number,
  },
  size: number,
  from: number,
  entityTypes: Set<EntityType>,
  filterGroups: Map<string, Set<string>>,
  isBestOf: boolean,
};


export type WorksAPIFreetextFieldsType = {
  allFieldsTerm: string,
  title: string,
  FRNr: string,
  location: string,
  inventoryNumber: string,
};
