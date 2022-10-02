export enum EntityType {
  PAINTINGS = 'PAINTING',
  GRAPHICS = 'GRAPHIC',
  ARCHIVALS = 'ARCHIVAL',
  DOCUMENTS = 'DOCUMENT',
  UNKNOWN = 'UNKNOWN',
};

export type APIFilterType = {
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
  searchSortingNumber: string,
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
