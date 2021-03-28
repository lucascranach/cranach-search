import React from 'react'

import Search from './components/pages/search';

import StoreProvider from './providers/StoreProvider';

function App() {
  return (
    <StoreProvider>
      <div className="app page">
        <div className="main-content">
          <Search></Search>
        </div>
      </div>
    </StoreProvider>
  )
}

export default App
