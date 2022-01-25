import React, { FC, useContext, useState, KeyboardEvent } from 'react';
import { observer } from 'mobx-react-lite';

import Btn from '../../../base/interacting/btn';
import TextInput from '../../../base/interacting/text-input';
import DatingRangeslider from '../../../base/interacting/dating-rangeslider';
import Accordion from '../accordion';
import Checkbox from '../../../base/interacting/checkbox';
import TreeList, { TreeListItem } from '../tree-list';
import Size from '../../../base/visualizing/size';
import Toggle from '../../../base/interacting/toggle';

import translations from './translations.json';
import './search.scss';

import StoreContext, {
  GlobalSearchFilterGroupItem,
  GlobalSearchFilterItem,
  UISidebarStatusType,
  UISidebarContentType,
} from '../../../../store/StoreContext';

const Search: FC = () => {
  const { root: { globalSearch, ui } } = useContext(StoreContext);

  const { t } = ui.useTranslation('Search', translations);

  const hits = globalSearch.result?.meta.hits ?? 0;
  const catalogWorkReferenceNames = 'Friedländer, Rosenberg (1978)';

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

  const isActiveFilter = ui.sidebarStatus === UISidebarStatusType.MAXIMIZED && ui.sidebarContent === UISidebarContentType.FILTER ? 'search--is-active' : '';

  const triggerFilterRequestOnEnter = (e: KeyboardEvent) => {
    if ((e.code && e.code === 'Enter') || (e.keyCode === 13)) {
      globalSearch.applyFreetextFields();
      globalSearch.triggerFilterRequest();
    }
  }

  return (
    <div
      className={`search ${isActiveFilter}`}
      data-component="structure/interacting/search"
    >
      <div className="search-result-info">
        <h2>{t('Search')}<Size size={hits} /></h2>
      </div>
      <fieldset className="block">
        <TextInput
          className="search-input"
          label={ t('all Fields') }
          value={ globalSearch.freetextFields.allFieldsTerm }
          onChange={ allFieldsTerm => globalSearch.setFreetextFields({ allFieldsTerm }) }
          onKeyDown={ triggerFilterRequestOnEnter }
          resetable={true}
        ></TextInput>

        <Toggle
          isOpen={ui.additionalSearchInputsVisible}
          onToggle={ () => ui.setAdditionalSearchInputsVisible(!ui.additionalSearchInputsVisible) }
        >
          <TextInput
            className="search-input"
            label={ t('Title') }
            value={ globalSearch.freetextFields.title }
            onChange={ title => globalSearch.setFreetextFields({ title }) }
            onKeyDown={ triggerFilterRequestOnEnter }
          ></TextInput>

          <TextInput
            className="search-input"
            label={ t('{{catalogWorkReferenceNames}} No.', { catalogWorkReferenceNames }) } value={ globalSearch.freetextFields.FRNr }
            onChange={ FRNr => globalSearch.setFreetextFields({ FRNr }) }
            onKeyDown={ triggerFilterRequestOnEnter }
          ></TextInput>

          <TextInput
            className="search-input"
            label={ t('Location') }
            value={ globalSearch.freetextFields.location }
            onChange={ location => globalSearch.setFreetextFields({ location }) }
            onKeyDown={ triggerFilterRequestOnEnter }
          ></TextInput>

          <TextInput
            className="search-input"
            label={ t('CDA ID / Inventorynumber') }
            value={ globalSearch.freetextFields.inventoryNumber }
            onChange={ inventoryNumber => globalSearch.setFreetextFields({ inventoryNumber }) }
            onKeyDown={ triggerFilterRequestOnEnter }
          ></TextInput>
        </Toggle>

        <Btn
          className="search-button"
          click={ () => globalSearch.triggerFilterRequest() }
        >{ t('find') }</Btn>

        <span
          className="reset-filters"
          onClick={ () => globalSearch.resetAllFilters() }
        >{ t('reset all filters') }</span>
      </fieldset>


      <fieldset className="block">
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
            >{ t('Best works')}<Size size={ globalSearch.bestOfFilter?.docCount ?? 0 }/></span>
          </span>
        </div>

        <Accordion>
          <Accordion.Entry
            title={ t('Dating') }
            isOpen={ true }
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
                return (<Accordion.Entry key={ item.id } title={ item.name }>
                  <TreeList
                    items={ item.children ?? [] }
                    wrapComponent={
                      (item, toggle) => (<span className={ `filter-info-item ${ (item.data?.count ?? 0) === 0 ? 'filter-info-item__inactive' : '' }` }>
                        <Checkbox
                          className="filter-info-item__checkbox"
                          checked={ globalSearch.filters.filterGroups.get(item.data?.groupKey as string)?.has(item.id) }
                          onChange={ () => toggleFilterItemActiveStatus(item.data?.groupKey as string , item.id) }
                        />
                        <span
                          className="filter-info-item__name"
                          data-count={ item.data?.count }
                          onClick={ toggle }
                        >{ item.name }<Size size={item.data?.count}/></span>
                      </span>)
                    }
                  ></TreeList>
                </Accordion.Entry>)
              }
            )
          }
        </Accordion>
      </fieldset>
    </div>
  );
};

export default observer(Search);
