import { createContext } from 'react';
import { configure } from 'mobx';

import { RootStoreInterface } from './rootStore';

export { GlobalSearchEntityType } from './domains/globalSearch';
export type {
  GlobalSearchFilterGroupItem,
  GlobalSearchFilterItem,
} from './domains/globalSearch';
export { UISidebarContentType, UIOverviewViewType, UISidebarStatusType } from './domains/ui';

configure({
  useProxies: 'never',
});

type StoreDefaultType = {
  root: RootStoreInterface;
}

export default createContext<StoreDefaultType>({} as StoreDefaultType);
