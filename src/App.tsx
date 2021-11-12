import React, { Fragment } from 'react'
import Dashboard from './components/pages/dashboard';
import Navigation from './components/structure/interacting/navigation';


function App() {
  return (
    <Fragment>
      <Navigation></Navigation>
      <div className="app page">
        <div className="main-content">
          <Dashboard></Dashboard>
        </div>
      </div>
    </Fragment>
  )
}

export default App
