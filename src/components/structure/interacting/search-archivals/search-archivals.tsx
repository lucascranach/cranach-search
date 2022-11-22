import React, { FC, useContext, KeyboardEvent } from 'react';
import { observer } from 'mobx-react-lite';

import Btn from '../../../base/interacting/btn';
import TextInput from '../../../base/interacting/text-input';
import DatingRangeslider from '../../../base/interacting/dating-rangeslider';
import Accordion from '../accordion';
import Checkbox from '../../../base/interacting/checkbox';
import TreeList, { TreeListItem } from '../tree-list';
import Size from '../../../base/visualizing/size';
import Logo from '../../../base/visualizing/logo';

import translations from './translations.json';
import './search-archivals.scss';

import StoreContext, {
  FilterGroupItem,
  FilterItem,
  UISidebarStatusType,
  UISidebarContentType,
} from '../../../../store/StoreContext';

const SearchArchivals: FC = () => {
  const { root: { lighttable, searchArchivals, ui } } = useContext(StoreContext);

  const { t } = ui.useTranslation('Search', translations);

  const filterCount = searchArchivals.amountOfActiveFilters;
  const hits = lighttable.result?.meta.hits ?? 0;

  const filterFlatGroups = searchArchivals.filters.flatGroups ?? [];
  const filterFlatGroupsTranslationMap: Record<string, string> = {
    institution: 'Institutions',
  };

  const mapFilterGroupItemsToTreeList = (filters: FilterGroupItem[]): TreeListItem[] => filters.map((filter) => ({
    id: filter.key,
    name: t(filterFlatGroupsTranslationMap[filter.key] || filter.text),
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

  const mappedFiltersFlatInfos = mapFilterGroupItemsToTreeList(filterFlatGroups);

  const toggleFilterItemActiveStatus = (groupKey: string, filterInfoId: string) => {
     searchArchivals.toggleFilterItemActiveStatus(groupKey, filterInfoId);
  };

  const isActiveFilter = ui.sidebarStatus === UISidebarStatusType.MAXIMIZED && ui.sidebarContent === UISidebarContentType.FILTER ? 'search-archivals--is-active' : '';

  const triggerFilterRequest = () => {
    searchArchivals.applyFreetextFields();
    searchArchivals.triggerFilterRequest();
  }

  const triggerFilterRequestOnEnter = (e: KeyboardEvent) => {
    if ((e.code && e.code === 'Enter') || (e.keyCode === 13)) {
      triggerFilterRequest();
    }
  }

  return (
    <div
      className={`search-archivals ${isActiveFilter}`}
      data-component="structure/interacting/search-archivals"
    >
      <Logo />
      <div className="search-result-info">
        {hits === 1 && <p><Size size={hits} /> {t('archival found')}</p>}
        {(hits > 1 || hits === 0) && <p><Size size={hits} /> { t('archivals found') }</p>}
      </div>
      <fieldset className="block keyword-search">
        <TextInput
          placeholder={t('Enter Search Keyword')}
          className="search-input"
          value={ searchArchivals.freetextFields.allFieldsTerm }
          onChange={ allFieldsTerm => searchArchivals.setFreetextFields({ allFieldsTerm }) }
          onKeyDown={ triggerFilterRequestOnEnter }
          onReset={ triggerFilterRequest }
          resetable={true}
        ></TextInput>

        <Btn
          className="search-button"
          icon="search"
          click={ triggerFilterRequest }
        >{ t('find') }</Btn>

      </fieldset>


      <fieldset className="block">

        <Accordion>
          <Accordion.Entry
            title={ t('Dating') }
            isOpen={ ui.filterItemIsExpanded('archivals-dating') }
            onToggle={ (isOpen) => ui.setFilterItemExpandedState('archivals-dating', isOpen) }
          >
            <DatingRangeslider
              bounds={searchArchivals.datingRangeBounds}
              start={searchArchivals.selectedFilters.dating.fromYear}
              end={searchArchivals.selectedFilters.dating.toYear}
              onChange={ (start: number, end: number) => searchArchivals.setDating(start, end) }
            ></DatingRangeslider>
          </Accordion.Entry>

          { mappedFiltersFlatInfos.map(
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
                          checked={ searchArchivals.selectedFilters.filterGroups.get(treeListItem.data?.groupKey as string)?.has(treeListItem.id) }
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
                searchArchivals.resetAllFilters();
                searchArchivals.triggerFilterRequest();
              } }
            >{ t('reset filters') }</Btn>
          </div>
        }
      </fieldset>
    </div>
  );
};

export default observer(SearchArchivals);
