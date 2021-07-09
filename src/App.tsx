import React, { Fragment, useContext, useEffect } from 'react'
import { useRouteMatch, useHistory } from 'react-router-dom'

import StoreContext from './store/StoreContext';
import Search from './components/pages/search';
import Navigation from './components/structure/interacting/navigation';


function App() {
  const { ui } = useContext(StoreContext);
  const history = useHistory();
  const match = useRouteMatch<{ lang: string }>(`${import.meta.env.BASE_URL}:lang`);

  useEffect(() => {
    if(match && ui.allowedLangs.includes(match.params.lang)) {
      ui.setLanguage(match.params.lang);
    } else {
      history.replace(`${import.meta.env.BASE_URL}${ui.lang}/`);
    }
  }, [ui.allowedLangs, match, history]);

  useEffect(() => {
    history.replace(`${import.meta.env.BASE_URL}${ui.lang}/`);
  }, [ui.lang, history]);

  return (
    <Fragment>
      <Navigation></Navigation>
      <div className="app page">
        <div className="main-content">
          <Search></Search>
        </div>
      </div>
    </Fragment>
  )
}

export default App
