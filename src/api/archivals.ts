
import {
  EntityType,
  ArtifactKind,
  GlobalSearchResponse,
  GlobalSearchFilterItem,
  GlobalSearchFilterGroupItem,
} from './types';

import {
  querify,
  apiConfiguration,
} from './utils';

const mapFilterFlatGroupsItem = (filter: any): GlobalSearchFilterItem => {
  return {
    id: filter.value,
    text: filter.display_value,
    doc_count: filter.doc_count,
    is_available: filter.is_available,
    children: [],
  };
};

const mapFilterFlatGroups = (filters: any): GlobalSearchFilterGroupItem[] => {
  return [
    'institution',
  ].map((filterName) => ({
    key: filterName,
    text: filterName,
    children: (filters[filterName].values || []).map(mapFilterFlatGroupsItem),
  }));
};

const assembleResultData = (resultset: any): GlobalSearchResponse => {
  const items = resultset.data.results.map((item: any) => toArtefact(item));
  const filterFlatGroups = mapFilterFlatGroups(resultset.data.filters);
  const meta = resultset.data.meta;
  return {
    result: { items, meta },
    filters: {
      groups: [],
      flatGroups: filterFlatGroups,
      single: [],
    },
  };
}

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

  if (filters.filterGroups.has('institution')) {
    const repositoryValues = Array.from(filters.filterGroups.get('institution') || []);
    if (repositoryValues.length) {
      params['institution:eq'] = repositoryValues.join(',');
    }
  }

  return querify(params);
};

const searchByFilters = async (
  filters: ArchivalsAPIFilterType,
  langCode: string
): Promise<GlobalSearchResponse | null> => {
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

const executeQuery = async (
  queryParams: string
): Promise<GlobalSearchResponse | null> => {
  const { host, authUser, authPass } = apiConfiguration;
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
};

export const toArtefact = (item: any): ArchivalSearchArtifact => {
  return {
    kind: ArtifactKind.ARCHIVAL,
    id: item.inventory_number,
    entityType: EntityType.ARCHIVAL,
    title: item.title,
    date: item.dating,
    repository: item.repository,
    owner: item.owner,
    classification: item.classification,
    dimensions: item.dimensions,
    objectName: item.object_name,
    imgSrc: item.img_src,
    searchSortingNumber: item.search_sorting_number,
    _highlight: item._highlight,
  }
};

export interface ArchivalSearchArtifact {
  kind: ArtifactKind.ARCHIVAL;
  id: string,
  title: string,
  entityType: EntityType;
  date: string,
  repository: string,
  owner: string,
  classification: string,
  dimensions: string,
  objectName: string,
  imgSrc: string,
  searchSortingNumber: string,
  _highlight?: Record<string, Array<string>>;
}

export interface ArchivalsAPIFilterType {
  dating: {
    fromYear: number,
    toYear: number,
  },
  size: number,
  from: number,
  entityTypes: Set<EntityType>,
  filterGroups: Map<string, Set<string>>,
};
