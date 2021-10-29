import { createContext } from 'react';
import { configure } from 'mobx';

import { UIStoreInterface } from './domains/ui';
import { CollectionStoreInterface } from './domains/collection';
import { GlobalSearchStoreInterface } from './domains/globalSearch';

export { GlobalSearchEntityType } from './domains/globalSearch';
export type {
  GlobalSearchFilterGroupItem,
  GlobalSearchFilterItem,
} from './domains/globalSearch';
export { UISidebarType, UIOverviewViewType } from './domains/ui';

configure({
  useProxies: 'never',
});

type StoreDefaultType = {
  ui: UIStoreInterface;
  globalSearch: GlobalSearchStoreInterface;
  collection: CollectionStoreInterface;
}

export default createContext<StoreDefaultType>({} as StoreDefaultType);
