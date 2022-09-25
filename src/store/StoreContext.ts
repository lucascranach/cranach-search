import { createContext } from 'react';
import { configure } from 'mobx';

import { RootStoreInterface } from './rootStore';

export { EntityType } from './domains/lighttable';
export type {
  FilterGroupItem,
  FilterItem,
} from './domains/lighttable';
export { UISidebarContentType, UIOverviewViewType, UISidebarStatusType } from './domains/ui';

configure({
  useProxies: 'never',
});

type StoreDefaultType = {
  root: RootStoreInterface;
}

export default createContext<StoreDefaultType>({} as StoreDefaultType);
