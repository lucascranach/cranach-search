import React from 'react'

import Search from './components/pages/search';

import StoreProvider from './providers/StoreProvider';

function App() {
  return (
    <StoreProvider>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>
      <div className="app page">
        <div className="main-content">
          <Search></Search>
        </div>
      </div>
    </StoreProvider>
  )
}

export default App
