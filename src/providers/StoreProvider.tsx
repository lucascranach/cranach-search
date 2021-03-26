import React, { FC } from 'react';

import StoreContext from '../store/StoreContext';

import { UI, GlobalSearch } from '../store';
import globalSearchAPI from '../api/globalSearch';

const ui = new UI();
const globalSearch = new GlobalSearch(ui, globalSearchAPI);

const StoreProvider: FC = ({ children }) => (
  <StoreContext.Provider value={ { ui, globalSearch } }>
    {children}
  </StoreContext.Provider>
);

export default StoreProvider