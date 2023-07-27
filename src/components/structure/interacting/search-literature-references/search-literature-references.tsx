import React, { FC, useContext, KeyboardEvent } from 'react';
import { observer } from 'mobx-react-lite';

import Btn from '../../../base/interacting/btn';
import TextInput from '../../../base/interacting/text-input';
import Accordion from '../accordion';
import Checkbox from '../../../base/interacting/checkbox';
import TreeList, { TreeListItem } from '../tree-list';
import Size from '../../../base/visualizing/size';
import Logo from '../../../base/visualizing/logo';
import Toggle from '../../../base/interacting/toggle';

import translations from './translations.json';
import './search-literature-references.scss';

import StoreContext, {
  FilterGroupItem,
  FilterItem,
  UISidebarContentType,
  UISidebarStatusType,
} from '../../../../store/StoreContext';

const SearchLiteratureReferences: FC = () => {
  const { root: { lighttable, searchLiteratureReferences, ui } } = useContext(StoreContext);

  const { t } = ui.useTranslation('Search', translations);

  const filterCount = searchLiteratureReferences.amountOfActiveFilters;
  const hits = lighttable.result?.meta.hits ?? 0;

  const filterFlatGroups = searchLiteratureReferences.filters.flatGroups ?? [];
  const filterFlatGroupsTranslationMap: Record<string, string> = {
    media_type: 'Media type',
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

  const fetchResults = () => {
     lighttable.resetPagePos();
     lighttable.fetch();
  };

  const toggleFilterItemActiveStatus = (groupKey: string, filterInfoId: string) => {
     searchLiteratureReferences.toggleFilterItemActiveStatus(groupKey, filterInfoId);
     fetchResults();
  };

  const isActiveFilter = ui.sidebarStatus === UISidebarStatusType.MAXIMIZED && ui.sidebarContent === UISidebarContentType.FILTER
    ? 'search-literature-references--is-active'
    : '';

  const triggerFilterRequest = () => {
    searchLiteratureReferences.applyFreetextFields();
    fetchResults();
  };

  const triggerFilterRequestOnEnter = (e: KeyboardEvent) => {
    if ((e.code && e.code === 'Enter') || (e.keyCode === 13)) {
      triggerFilterRequest();
    }
  };

  return (
    <div
      className={ `search-literature-references ${isActiveFilter}`}
      data-component="structure/interacting/search-literature-references"
    >
      <Logo />
      <div className="search-result-info">
        {hits === 1 && <p><Size size={hits} /> {t('publication found')}</p>}
        {(hits > 1 || hits === 0) && <p><Size size={hits} /> { t('publications found') }</p>}
      </div>
      <fieldset className="block keyword-search">
        <TextInput
          placeholder={t('Enter Search Keyword')}
          className="search-input"
          value={ searchLiteratureReferences.freetextFields.allFieldsTerm }
          onChange={ allFieldsTerm => searchLiteratureReferences.setFreetextFields({ allFieldsTerm }) }
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
            label={ t('Author') }
            value={ searchLiteratureReferences.freetextFields.authors }
            onChange={ authors => searchLiteratureReferences.setFreetextFields({ authors }) }
            onKeyDown={ triggerFilterRequestOnEnter }
            onReset={ triggerFilterRequest }
            resetable={true}
          ></TextInput>

          <TextInput
            className="search-input"
            label={ t('Signature')}
            value={ searchLiteratureReferences.freetextFields.signature }
            onChange={ signature => searchLiteratureReferences.setFreetextFields({ signature }) }
            onKeyDown={ triggerFilterRequestOnEnter }
            onReset={ triggerFilterRequest }
            resetable={true}
          ></TextInput>

          <TextInput
            className="search-input"
            label={ t('Year') }
            value={ searchLiteratureReferences.freetextFields.year }
            onChange={ year => searchLiteratureReferences.setFreetextFields({ year }) }
            onKeyDown={ triggerFilterRequestOnEnter }
            onReset={ triggerFilterRequest }
            resetable={true}
          ></TextInput>

          <TextInput
            className="search-input"
            label={ t('Media type') }
            value={ searchLiteratureReferences.freetextFields.mediaType }
            onChange={ mediaType => searchLiteratureReferences.setFreetextFields({ mediaType }) }
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

        <Accordion>
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
                          checked={ searchLiteratureReferences.selectedFilters.filterGroups.get(treeListItem.data?.groupKey as string)?.has(treeListItem.id) }
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
                searchLiteratureReferences.resetAllFilters();
                fetchResults();
              } }
            >{ t('reset filters') }</Btn>
          </div>
        }
      </fieldset>
    </div>
  );
};

export default observer(SearchLiteratureReferences);
