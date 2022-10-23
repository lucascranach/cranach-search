import {
  EntityType,
  GlobalSearchResult,
  GlobalSearchArtifact,
} from './types';

import {
  querify,
  apiConfiguration,
} from './utils';

import { toArtefact as mapWorkToArtefact } from './works';
import { toArtefact as mapArchivalToArtefact } from './archivals';

const assembleResultData = (resultset: any): GlobalSearchResult => {
  const items = resultset.data.results.map((item: any) => toArtefact(item));
  const meta = resultset.data.meta;
  return { items, filterGroups: [], singleFilters: [], meta };
}

const toArtefact = (item: any): GlobalSearchArtifact => {
  switch (item.entity_type) {
    case 'ARCHIVAL':
      return mapArchivalToArtefact(item);

    case 'PAINTING':
    case 'GRAPHIC':
      return mapWorkToArtefact(item);

    default:
      throw new Error(`Unknown entityType for collection mapping: ${item.entity_type}`);
  }
};

const getQueryString = (
  inventoryNumbers: string[],
  langCode: string,
): string => {
  const params: Record<string, string | number> = {
    language: langCode,
    'inventory_number:eq': inventoryNumbers.join(','),
  };

  return querify(params);
};

const getByInventoryNumbers = async (
  inventoryNumbers: string[],
  langCode: string,
): Promise<GlobalSearchResult | null> => {

  const queryParams = getQueryString(
    inventoryNumbers,
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
): Promise<GlobalSearchResult | null> => {
  const { host, authUser, authPass } = apiConfiguration;
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
  getQueryString,
  getByInventoryNumbers,
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
