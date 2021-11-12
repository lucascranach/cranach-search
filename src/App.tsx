import React, { Fragment, useContext, useEffect } from 'react'
import StoreContext from './store/StoreContext';
import Dashboard from './components/pages/dashboard';
import Navigation from './components/structure/interacting/navigation';


function App() {
  const { root: { routing, ui } } = useContext(StoreContext);

  useEffect(() => {
    const match = routing.history.location.pathname.match(/^\/([a-z]+)\//);
    if(match && ui.allowedLangs.includes(match[1])) {
      ui.setLanguage(match[1]);
    } else {
      routing.history.replace({ ...routing.history.location, pathname: `${import.meta.env.BASE_URL}${ui.lang}/` });
    }
  }, [ui.allowedLangs, routing.history]);

  useEffect(() => {
    routing.history.replace({ ...routing.history.location, pathname: `${import.meta.env.BASE_URL}${ui.lang}/` });
  }, [ui.lang, routing.history]);

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
