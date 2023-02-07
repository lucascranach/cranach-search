import { ArchivalSearchArtifact } from "./archivals";
import { WorkSearchArtifact } from "./works";
import { LiteratureReferenceSearchArtifact } from "./literature-references";

export enum EntityType {
  PAINTING = 'PAINTING',
  GRAPHIC = 'GRAPHIC',
  ARCHIVAL = 'ARCHIVAL',
  LITERATURE_REFERENCE = 'LITERATURE_REFERENCE',
  UNKNOWN = 'UNKNOWN',
};

export enum ArtifactKind {
  WORK = 'WORK',
  ARCHIVAL = 'ARCHIVAL',
  LITERATURE_REFERENCE = 'LITERATURE_REFERENCE',
};

export interface APIFilterType {
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

export type GlobalSearchArtifact =
  WorkSearchArtifact | ArchivalSearchArtifact | LiteratureReferenceSearchArtifact;

export interface GlobalSearchFilterItem {
  id: string;
  text: string;
  doc_count: number;
  is_available: boolean;
  children: GlobalSearchFilterItem[];
}

export interface GlobalSearchFilterGroupItem {
  key: string,
  text: string;
  children: GlobalSearchFilterItem[];
}

export interface GlobalSearchResult {
  items: GlobalSearchArtifact[];
  meta: {
    hits: number;
  };
}

export interface GlobalSearchResponse {
  result: GlobalSearchResult;
  filters: {
    groups: GlobalSearchFilterGroupItem[];
    flatGroups: GlobalSearchFilterGroupItem[];
    single: GlobalSearchFilterItem[];
  };
}

export type SortingDirection  = 'asc' | 'desc';

export interface SortingItem {
  fieldName: string;
  direction: SortingDirection;
};

