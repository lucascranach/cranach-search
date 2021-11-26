import React, { FC } from 'react';
import { createBrowserHistory } from 'history';

import StoreContext from '../store/StoreContext';
import RootStore from '../store/rootStore';

const history = createBrowserHistory();

const StoreProvider: FC = ({ children }) => {
  const root = new RootStore(history);

  return (
    <StoreContext.Provider value={ { root } }>
      {children}
    </StoreContext.Provider>
  );
}

export default StoreProvider
