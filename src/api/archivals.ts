
import {
  EntityType,
  GlobalSearchResult,
  GlobalSearchArtifact,
} from './types';

import {
  querify,
} from './utils';

const host = import.meta.env.VITE_SEARCH_API_URL;
const authUser = import.meta.env.VITE_AUTH_USER;
const authPass = import.meta.env.VITE_AUTH_PASS;


const assembleResultData = (resultset: any): GlobalSearchResult => {
  const items = resultset.data.results.map((item: any) => toArtefact(item));
  const meta = resultset.data.meta;
  return { items, filterGroups: [], singleFilters: [], meta };
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
    printProcess: '',
    inventor: '',
    artist: '',
    dimensions: item.dimensions,
    objectName: item.object_name,
    imgSrc: item.img_src,
    medium: getMedium(item),
    searchSortingNumber: item.search_sorting_number,
    _highlight: item._highlight,
  }
};

const getQueryStringForFilters = (
  filters: ArchivalsAPIFilterType,
  langCode: string
): string => {
  const params: Record<string, string | number> = {
    language: langCode,
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

  if (!filters.entityTypes.has(EntityType.UNKNOWN)) {
    params['entity_type:eq'] = Array.from(filters.entityTypes).join(',');
  }

  return querify(params);
};

const searchByFilters = async (
  filters: ArchivalsAPIFilterType,
  langCode: string
): Promise<GlobalSearchResult | null> => {
  const queryParams = getQueryStringForFilters(
    filters,
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
      `${host}/archivals?${queryParams}`,
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
  getQueryStringForFilters,
  searchByFilters,
  retrieveUserCollection,
};


export type ArchivalsAPIFilterType = {
  dating: {
    fromYear: number,
    toYear: number,
  },
  size: number,
  from: number,
  entityTypes: Set<EntityType>,
};
