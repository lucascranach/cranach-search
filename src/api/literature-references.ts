
import {
  EntityType,
  GlobalSearchResponse,
  ArtifactKind,
  SortingItem,
} from './types';

import {
  querify,
  apiConfiguration,
} from './utils';

const sortingFieldnameMapping: Record<string, string> = {
  'referenceNumber': 'reference_number',
  'authors': 'authors',
  'publishLocation': 'publish_location',
  'publishDate': 'publish_date',
  'mediaType': 'publications_line',
};

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
  freetextFields: LiteratureReferencesAPIFreetextFieldsType,
  sorting: SortingItem[],
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

  const cleanAllFieldsTerm = freetextFields.allFieldsTerm.trim();
  if (cleanAllFieldsTerm !== '') {
    params['searchterm'] = cleanAllFieldsTerm;
  }

  const cleanAuthors = freetextFields.authors.trim();
  if (cleanAuthors) {
    params['authors:sim'] = cleanAuthors;
  }

  const cleanSignature = freetextFields.signature.trim();
  if (cleanSignature) {
    params['reference_number:sim'] = cleanSignature;
  }

  const cleanYear = freetextFields.year.trim();
  if (cleanYear) {
    params['publish_date:sim'] = cleanYear;
  }

  const cleanMediaType = freetextFields.mediaType.trim();
  if (cleanMediaType) {
    params['publication_text:sim'] = cleanMediaType;
  }

  if (sorting.length > 0) {
    params['sort_by'] = sorting
      .map(({fieldName, direction}) => `${sortingFieldnameMapping[fieldName] || fieldName}.${direction}`)
      .join(',');
  } else {
    // Sorting literature references by reference number by default
    params['sort_by'] = 'reference_number.asc';

  }

  return querify(params);
};

const searchByFilters = async (
  filters: LiteratureReferencesAPIFilterType,
  freetextFields: LiteratureReferencesAPIFreetextFieldsType,
  sorting: SortingItem[],
  langCode: string
): Promise<GlobalSearchResponse | null> => {
  const queryParams = getQueryStringForFilters(
    filters,
    freetextFields,
    sorting,
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
    subtitle: item.subtitle,
    journal: item.journal,
    publications: item.publications,
    mediaType: item.publications_line,
    date: item.dating,
    referenceNumber: item.reference_number,
    persons: item.persons,
    authors: item.authors,
    publishLocation: item.publish_location,
    publishDate: item.publish_date,
    searchSortingNumber: item.searchSortingNumber,
  };
};

interface LiteratureReferencePublication {
  type: string;
  text: string;
  remarks: string;
  subPublications: LiteratureReferencePublication[];
}

export interface LiteratureReferenceSearchArtifact {
  kind: ArtifactKind.LITERATURE_REFERENCE;
  id: string;
  entityType: EntityType;
  title: string;
  subtitle: string;
  journal: string;
  publications: LiteratureReferencePublication[];
  mediaType: string;
  date: string;
  referenceNumber: string;
  persons: { role: string, name: string }[],
  authors: string,
  publishLocation: string,
  publishDate: string,
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

export interface LiteratureReferencesAPIFreetextFieldsType {
  allFieldsTerm: string,
  authors: string,
  signature: string,
  year: string,
  mediaType: string,
};
