import React, { FC } from 'react';
import { History } from 'history';

import StoreContext from '../store/StoreContext';
import RootStore from '../store/rootStore';


type StoreProviderProps = {
  history: History;
};

const StoreProvider: FC<StoreProviderProps> = ({ children, history }) => {
  const root = new RootStore(history);

  return (
    <StoreContext.Provider value={ { root } }>
      {children}
    </StoreContext.Provider>
  );
}

export default StoreProvider
