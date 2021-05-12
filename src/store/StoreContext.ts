import { createContext } from 'react';
import { configure } from 'mobx';

import { UIStoreInterface } from './domains/ui';
import {
  GlobalSearchStoreInterface,
} from './domains/globalSearch';

export { GlobalSearchEntityType as GlobalSearchEntityType } from './domains/globalSearch';

configure({
  useProxies: 'never',
});

type StoreDefaultType = {
  ui?: UIStoreInterface;
  globalSearch?: GlobalSearchStoreInterface;
}

export default createContext<StoreDefaultType>({});
