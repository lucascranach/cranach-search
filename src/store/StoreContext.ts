import { createContext } from 'react';
import { configure } from 'mobx';

import { RootStoreInterface } from './rootStore';

export { EntityType } from './domains/searchBase';
export type {
  GlobalSearchFilterGroupItem,
  GlobalSearchFilterItem,
} from './domains/searchBase';
export { UISidebarContentType, UIOverviewViewType, UISidebarStatusType } from './domains/ui';

configure({
  useProxies: 'never',
});

type StoreDefaultType = {
  root: RootStoreInterface;
}

export default createContext<StoreDefaultType>({} as StoreDefaultType);
