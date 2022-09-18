import React, { useContext, Fragment, ReactNode } from 'react'
import { observer } from 'mobx-react-lite';

import Dashboard from './components/pages/dashboard';
import Search from './components/structure/interacting/search';
import MyCranach from './components/structure/interacting/my-cranach';
import SecondaryNavigation from './components/structure/interacting/secondary-navigation';
import SearchFieldsWorks from './components/variants/interacting/search-fields-works';
import SearchFiltersWorks from './components/variants/interacting/search-filters-works';

import StoreContext, {
  GlobalSearchMode,
} from './store/StoreContext';

function App() {
  const { root: { globalSearch, ui } } = useContext(StoreContext);
  const isActiveSidebar = 'sidebar--is-active';

  /* Fields */
  const searchFieldsComponentMapping: Record<GlobalSearchMode, ReactNode> = {
    [GlobalSearchMode.WORKS]: (<SearchFieldsWorks />),
    [GlobalSearchMode.ARCHIVALS]: (<Fragment />),
  };

  const customSearchFields = searchFieldsComponentMapping[globalSearch.searchMode]
    ? searchFieldsComponentMapping[globalSearch.searchMode]
    : Fragment;

  /* Filters */
  const searchFiltersComponentMapping: Record<GlobalSearchMode, ReactNode> = {
    [GlobalSearchMode.WORKS]: (<SearchFiltersWorks />),
    [GlobalSearchMode.ARCHIVALS]: (<Fragment />),
  };

  const customSearchFilters = searchFiltersComponentMapping[globalSearch.searchMode]
    ? searchFiltersComponentMapping[globalSearch.searchMode]
    : Fragment;

  return (
    <Fragment>
      <div className="app page">
        <Dashboard></Dashboard>
        <aside className={`sidebar  ${isActiveSidebar}`}>
          <SecondaryNavigation />
          <Search
            customFields={customSearchFields}
            customFilters={customSearchFilters}
          ></Search>
          <MyCranach />
        </aside>
      </div>
    </Fragment>
  )
}

export default observer(App);
