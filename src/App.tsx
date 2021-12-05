import React, { Fragment } from 'react'
import Dashboard from './components/pages/dashboard';
import Search from './components/structure/interacting/search';
import MyCranach from './components/structure/interacting/my-cranach';
import SecondaryNavigation from './components/structure/interacting/secondary-navigation';

function App() {
  const isActiveSidebar = 'sidebar--is-active';

  return (
    <Fragment>
      <div className="app page">
        <Dashboard></Dashboard>
        <aside className={`sidebar ${isActiveSidebar}`}>
          <SecondaryNavigation />
          <Search />
          <MyCranach />
        </aside>
      </div>
    </Fragment>
  )
}

export default App
