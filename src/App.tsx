import React, { Fragment, useContext, useEffect } from 'react'
import StoreContext from './store/StoreContext';
import Dashboard from './components/pages/dashboard';
import Search from './components/structure/interacting/search';
import MyCranach from './components/structure/interacting/my-cranach';
import SecondaryNavigation from './components/structure/interacting/secondary-navigation';

function App() {
  const { root: { routing, ui } } = useContext(StoreContext);
  const isActiveSidebar = 'sidebar--is-active';

  useEffect(() => {
    const match = routing.history.location.pathname.match(/^\/([a-z]+)\/?/);
    if (match && (match[1] in ui.allowedLangs)) {
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
