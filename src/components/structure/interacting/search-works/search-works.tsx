import React, { FC, useContext, KeyboardEvent} from 'react';
import { observer } from 'mobx-react-lite';

import Btn from '../../../base/interacting/btn';
import TextInput from '../../../base/interacting/text-input';
import DatingRangeslider from '../../../base/interacting/dating-rangeslider';
import Accordion from '../accordion';
import Checkbox from '../../../base/interacting/checkbox';
import TreeList, { TreeListItem } from '../tree-list';
import Size from '../../../base/visualizing/size';
import Toggle from '../../../base/interacting/toggle';
import Logo from '../../../base/visualizing/logo';

import translations from './translations.json';
import './search-works.scss';

import StoreContext, {
  FilterGroupItem,
  FilterItem,
  UISidebarStatusType,
  UISidebarContentType,
} from '../../../../store/StoreContext';

const SearchWorks: FC = () => {
  const { root: { lighttable, searchWorks, ui } } = useContext(StoreContext);

  const { t } = ui.useTranslation('Search', translations);

  const filterCount = searchWorks.amountOfActiveFilters;
  const hits = lighttable.result?.meta.hits ?? 0;
  const catalogWorkReferenceNames = 'Friedländer, Rosenberg (1978)';

  const filterGroups = searchWorks.filters.groups ?? [];

  const mapFilterGroupItemsToTreeList = (filters: FilterGroupItem[]): TreeListItem[] => filters.map((filter) => ({
    id: filter.key,
    name: filter.text,
    children: mapFilterItemToTreeList(filter.children, filter.key),
  }));

  const mapFilterItemToTreeList = (filters: FilterItem[], groupKey: string): TreeListItem[] => filters.map((filter) => ({
    id: filter.id,
    name: filter.text,
    children: mapFilterItemToTreeList(filter.children, groupKey),
    data: {
      count: filter.doc_count,
      groupKey,
    },
  }));

  const mappedFiltersInfos = mapFilterGroupItemsToTreeList(filterGroups);

  const fetchResults = () => {
     lighttable.resetPagePos();
     lighttable.fetch();
  };

  const toggleFilterItemActiveStatus = (groupKey: string, filterInfoId: string) => {
     searchWorks.toggleFilterItemActiveStatus(groupKey, filterInfoId);
     fetchResults();
  };

  const isActiveFilter = ui.sidebarStatus === UISidebarStatusType.MAXIMIZED && ui.sidebarContent === UISidebarContentType.FILTER ? 'search-works--is-active' : '';

  const triggerFilterRequest = () => {
    searchWorks.applyFreetextFields();
    fetchResults();
  };

  const triggerFilterRequestOnEnter = (e: KeyboardEvent) => {
    if ((e.code && e.code === 'Enter') || (e.keyCode === 13)) {
      triggerFilterRequest();
    }
  };

  return (
    <div
      className={`search-works ${isActiveFilter}`}
      data-component="structure/interacting/search-works"
    >
      <Logo />
      <div className="search-result-info">
        {hits === 1 && <p><Size size={hits} /> {t('work found')}</p>}
        {(hits > 1 || hits === 0) && <p><Size size={hits} /> { t('works found') }</p>}
      </div>
      <fieldset className="block keyword-search">
        <TextInput
          placeholder={t('Enter Search Keyword')}
          className="search-input"
          value={ searchWorks.freetextFields.allFieldsTerm }
          onChange={ allFieldsTerm => searchWorks.setFreetextFields({ allFieldsTerm }) }
          onKeyDown={ triggerFilterRequestOnEnter }
          onReset={ triggerFilterRequest }
          resetable={true}
        ></TextInput>

        <Toggle
          className="advanced-search-toggle"
          isOpen={ui.additionalSearchInputsVisible}
          title={t('Advanced Search')}
          onToggle={ () => ui.setAdditionalSearchInputsVisible(!ui.additionalSearchInputsVisible) }
        >

          <TextInput
            className="search-input"
            label={ t('Title') }
            value={ searchWorks.freetextFields.title }
            onChange={ title => searchWorks.setFreetextFields({ title }) }
            onKeyDown={ triggerFilterRequestOnEnter }
            onReset={ triggerFilterRequest }
            resetable={true}
          ></TextInput>

          <TextInput
            className="search-input"
            label={ t('{{catalogWorkReferenceNames}} No.', { catalogWorkReferenceNames }) } value={ searchWorks.freetextFields.FRNr }
            onChange={ FRNr => searchWorks.setFreetextFields({ FRNr }) }
            onKeyDown={ triggerFilterRequestOnEnter }
            onReset={ triggerFilterRequest }
            resetable={true}
          ></TextInput>

          <TextInput
            className="search-input"
            label={ t('Location') }
            value={ searchWorks.freetextFields.location }
            onChange={ location => searchWorks.setFreetextFields({ location }) }
            onKeyDown={ triggerFilterRequestOnEnter }
            onReset={ triggerFilterRequest }
            resetable={true}
          ></TextInput>

          <TextInput
            className="search-input"
            label={ t('CDA ID / Inventorynumber') }
            value={ searchWorks.freetextFields.inventoryNumber }
            onChange={ inventoryNumber => searchWorks.setFreetextFields({ inventoryNumber }) }
            onKeyDown={ triggerFilterRequestOnEnter }
            onReset={ triggerFilterRequest }
            resetable={true}
          ></TextInput>
        </Toggle>

        <Btn
          className="search-button"
          icon="search"
          click={ triggerFilterRequest }
        >{ t('find') }</Btn>

      </fieldset>


      <fieldset className="block">
        <div className="single-filter">
          {/* isBestOf */}
          <span className={ `filter-info-item ${ (searchWorks.bestOfFilter?.docCount) === 0 ? 'filter-info-item__inactive' : '' }` }>
            <Checkbox
              className="filter-info-item__checkbox"
              checked={ searchWorks.selectedFilters.isBestOf }
              onChange={ () => {
                searchWorks.setIsBestOf(!searchWorks.selectedFilters.isBestOf);
                fetchResults();
              }}
            />
            <span
              className="filter-info-item__name"
              data-count={ searchWorks.bestOfFilter?.docCount ?? 0 }
            >{ t('Masterpieces')}<Size size={ searchWorks.bestOfFilter?.docCount ?? 0 }/></span>
          </span>
        </div>

        <Accordion>
          <Accordion.Entry
            title={ t('Dating') }
            isOpen={ ui.filterItemIsExpanded('dating') }
            onToggle={ (isOpen) => ui.setFilterItemExpandedState('dating', isOpen) }
          >
            <DatingRangeslider
              bounds={searchWorks.datingRangeBounds}
              start={searchWorks.selectedFilters.dating.fromYear}
              end={searchWorks.selectedFilters.dating.toYear}
              onChange={ (start: number, end: number) => {
                searchWorks.setDating(start, end);
                fetchResults();
              }}
            ></DatingRangeslider>
          </Accordion.Entry>

          { mappedFiltersInfos.map(
              (item) => {
                return (<Accordion.Entry
                  key={ item.id }
                  title={ item.name }
                  isOpen={ ui.filterItemIsExpanded(item.id) }
                  onToggle={ (isOpen) => ui.setFilterItemExpandedState(item.id, isOpen) }
                >
                  <TreeList
                    items={ item.children ?? [] }
                    isOpenIf={ (treeListItem) => ui.filterItemIsExpanded(treeListItem.id) }
                    onToggle={ (treeListItem, isOpen) => {
                      /* Keeping track of the collapse state to, to stay collapsed on page refresh */
                      ui.setFilterItemExpandedState(treeListItem.id, isOpen);
                    }}
                    wrapComponent={
                      (treeListItem, toggle) => (<span className={ `filter-info-item ${ (treeListItem.data?.count ?? 0) === 0 ? 'filter-info-item__inactive' : '' }` }>
                        <Checkbox
                          className="filter-info-item__checkbox"
                          checked={ searchWorks.selectedFilters.filterGroups.get(treeListItem.data?.groupKey as string)?.has(treeListItem.id) }
                          onChange={ () => toggleFilterItemActiveStatus(treeListItem.data?.groupKey as string , treeListItem.id) }
                        />
                        <span
                          className="filter-info-item__name"
                          data-count={ treeListItem.data?.count }
                          onClick={ toggle }
                        >{ treeListItem.name }<Size size={treeListItem.data?.count}/></span>
                      </span>)
                    }
                  ></TreeList>
                </Accordion.Entry>)
              }
            )
          }
        </Accordion>

        {filterCount > 0 &&
          <div className="sticky-panel">
            <Btn
              className="reset-button"
              icon="delete_sweep"
              click={ () => {
                searchWorks.resetAllFilters();
                fetchResults();
              } }
            >{ t('reset filters') }</Btn>
          </div>
        }
      </fieldset>
    </div>
  );
};

export default observer(SearchWorks);
