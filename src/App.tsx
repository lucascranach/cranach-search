import React from 'react'

import Search from './components/pages/search';
import Navigation from './components/structure/interacting/navigation';
import StoreProvider from './providers/StoreProvider';

function App() {
  return (
    <StoreProvider>
      <Navigation></Navigation>
      <div className="app page">
        <div className="main-content">
          <Search></Search>
        </div>
      </div>
    </StoreProvider>
  )
}

export default App
