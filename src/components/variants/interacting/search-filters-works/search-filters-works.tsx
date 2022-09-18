import React, { FC, useContext } from 'react';
import { observer } from 'mobx-react-lite';

import DatingRangeslider from '../../../base/interacting/dating-rangeslider';
import Accordion from '../../../structure/interacting/accordion';
import Checkbox from '../../../base/interacting/checkbox';
import TreeList, { TreeListItem } from '../../../structure/interacting/tree-list';
import Size from '../../../base/visualizing/size';

import translations from './translations.json';
import './search-filters-works.scss';

import StoreContext, {
  GlobalSearchFilterGroupItem,
  GlobalSearchFilterItem,
} from '../../../../store/StoreContext';

const SearchFiltersWorks: FC = () => {
  const { root: { globalSearch, ui } } = useContext(StoreContext);

  const { t } = ui.useTranslation('Search', translations);

  const filterGroups = globalSearch.result?.filterGroups ?? [];

  const mapFilterGroupItemsToTreeList = (filters: GlobalSearchFilterGroupItem[]): TreeListItem[] => filters.map((filter) => ({
    id: filter.key,
    name: filter.text,
    children: mapFilterItemToTreeList(filter.children, filter.key),
  }));

  const mapFilterItemToTreeList = (filters: GlobalSearchFilterItem[], groupKey: string): TreeListItem[] => filters.map((filter) => ({
    id: filter.id,
    name: filter.text,
    children: mapFilterItemToTreeList(filter.children, groupKey),
    data: {
      count: filter.doc_count,
      groupKey,
    },
  }));

  const mappedFiltersInfos = mapFilterGroupItemsToTreeList(filterGroups);

  const toggleFilterItemActiveStatus = (groupKey: string, filterInfoId: string) => {
     globalSearch.toggleFilterItemActiveStatus(groupKey, filterInfoId);
  };

  return (
    <div className="search-filters-works">
      <div className="single-filter">
          {/* isBestOf */}
          <span className={ `filter-info-item ${ (globalSearch.bestOfFilter?.docCount) === 0 ? 'filter-info-item__inactive' : '' }` }>
            <Checkbox
              className="filter-info-item__checkbox"
              checked={ globalSearch.filters.isBestOf }
              onChange={ () => globalSearch.setIsBestOf(!globalSearch.filters.isBestOf) }
            />
            <span
              className="filter-info-item__name"
              data-count={ globalSearch.bestOfFilter?.docCount ?? 0 }
            >{ t('Masterpieces')}<Size size={ globalSearch.bestOfFilter?.docCount ?? 0 }/></span>
          </span>
        </div>

        <Accordion>
          <Accordion.Entry
            title={ t('Dating') }
            isOpen={ ui.filterItemIsExpanded('dating') }
            onToggle={ (isOpen) => ui.setFilterItemExpandedState('dating', isOpen) }
          >
            <DatingRangeslider
              bounds={globalSearch.datingRangeBounds}
              start={globalSearch.filters.dating.fromYear}
              end={globalSearch.filters.dating.toYear}
              onChange={ (start: number, end: number) => globalSearch.setDating(start, end) }
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
                          checked={ globalSearch.filters.filterGroups.get(treeListItem.data?.groupKey as string)?.has(treeListItem.id) }
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
    </div>
  );
};

export default observer(SearchFiltersWorks);
