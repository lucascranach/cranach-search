import React, { FC } from 'react';

import StoreContext from '../store/StoreContext';

import { UI, GlobalSearch, Collection } from '../store';
import globalSearchAPI from '../api/globalSearch';

const ui = new UI();

const globalSearch = new GlobalSearch(ui, globalSearchAPI);
const collection = new Collection(globalSearch);

const StoreProvider: FC = ({ children }) => (
  <StoreContext.Provider value={ { ui, globalSearch, collection } }>
    {children}
  </StoreContext.Provider>
);

export default StoreProvider
