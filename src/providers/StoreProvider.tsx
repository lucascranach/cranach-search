import React, { FC } from 'react';

import StoreContext from '../store/StoreContext';

import { UI, GlobalSearch, Collection } from '../store';
import globalSearchAPI from '../api/globalSearch';

const ui = new UI();
const collection = new Collection();
const globalSearch = new GlobalSearch(ui, collection, globalSearchAPI);

const StoreProvider: FC = ({ children }) => (
  <StoreContext.Provider value={ { ui, globalSearch, collection } }>
    {children}
  </StoreContext.Provider>
);

export default StoreProvider
