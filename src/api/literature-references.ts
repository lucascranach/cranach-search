
import {
  EntityType,
  GlobalSearchArtifact,
  GlobalSearchResponse,
  ArtifactKind,
} from './types';

import {
  querify,
  apiConfiguration,
} from './utils';

const assembleResultData = (resultset: any): GlobalSearchResponse => {
  const items = resultset.data.results.map((item: any) => toArtefact(item));
  const meta = resultset.data.meta;
  return {
    result: { items, meta },
    filters: {
      groups: [],
      flatGroups: [],
      single: [],
    },
  };
}

const getQueryStringForFilters = (
  filters: LiteratureReferencesAPIFilterType,
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

  if (!filters.entityTypes.has(EntityType.UNKNOWN)) {
    params['entity_type:eq'] = Array.from(filters.entityTypes).join(',');
  }

  // Sorting literature references by reference number
  params['sort_by'] = 'reference_number.asc';

  return querify(params);
};

const searchByFilters = async (
  filters: LiteratureReferencesAPIFilterType,
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
      `${host}/literature_references?${queryParams}`,
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

export const toArtefact = (item: any): LiteratureReferenceSearchArtifact => {
  return {
    kind: ArtifactKind.LITERATURE_REFERENCE,
    id: item.reference_id,
    entityType: item.entity_type,
    title: item.title,
    date: item.dating,
    referenceNumber: item.reference_number,
    persons: item.persons,
    publishLocation: item.publish_location,
    publishYear: item.publish_date,
    searchSortingNumber: item.searchSortingNumber,
  };
};

export interface LiteratureReferenceSearchArtifact {
  kind: ArtifactKind.LITERATURE_REFERENCE;
  id: string;
  entityType: EntityType;
  title: string;
  date: string;
  referenceNumber: string;
  persons: { role: string, name: string }[],
  publishLocation: string,
  publishYear: string,
  searchSortingNumber: string;
  _highlight?: Record<string, Array<string>>;
}

export interface LiteratureReferencesAPIFilterType {
  dating: {
    fromYear: number,
    toYear: number,
  },
  size: number,
  from: number,
  entityTypes: Set<EntityType>,
  filterGroups: Map<string, Set<string>>,
};
