import React, { FC, useState, useContext } from 'react';
import { observer } from 'mobx-react-lite';

import Btn from '../../../base/interacting/btn';
import TextInput from '../../../base/interacting/text-input';
import Accordion from '../accordion';
import Checkbox from '../../../base/interacting/checkbox';
import TreeList, { TreeListItem } from '../tree-list';
import Size from '../../../base/visualizing/size';

import translations from './translations.json';
import './search.scss';

import StoreContext, {
  GlobalSearchFilterGroupItem,
  GlobalSearchFilterItem,
  UISidebarType,
} from '../../../../store/StoreContext';

const Search: FC = () => {
  const { globalSearch, ui } = useContext(StoreContext);

  const { t } = ui.useTranslation('Search', translations);

  const hits = globalSearch.result?.meta.hits ?? 0;
  const title = useState('*');
  const catalogWorkReferenceNumber = useState('*');
  const location = useState('*');
  const cdaIDInventorynumber = useState('*');
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

  const isActiveFilter = ui.sidebar === UISidebarType.FILTER ? 'search--is-active' : '';

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
          value={ globalSearch.allFieldsTerm }
          onChange={ term => globalSearch.searchForAllFieldsTerm(term) }
        ></TextInput>

        <TextInput
          className="search-input"
          label={ t('Title') }
          value={ title[0] }
          onChange={ title[1] }
        ></TextInput>

        <TextInput
          className="search-input"
          label={ t('{{catalogWorkReferenceNames}} No.', { catalogWorkReferenceNames }) } value={ catalogWorkReferenceNumber[0] }
          onChange={ catalogWorkReferenceNumber[1] }
        ></TextInput>

        <TextInput
          className="search-input"
          label={ t('Location') }
          value={ location[0] }
          onChange={ location[1] }
        ></TextInput>

        <TextInput
          className="search-input"
          label={ t('CDA ID / Inventorynumber') }
          value={ cdaIDInventorynumber[0] }
          onChange={ cdaIDInventorynumber[1] }
        ></TextInput>

        <Btn className="search-button">{ t('find') }</Btn>
      </fieldset>


      <fieldset className="block">
        <legend className="headline">{ t('Filter results by') }</legend>

        <Accordion>
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
