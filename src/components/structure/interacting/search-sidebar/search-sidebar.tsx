import React, { FC, useState, useContext } from 'react';
import { observer } from 'mobx-react-lite';

import Size from '../../../base/visualizing/size';
import Btn from '../../../base/interacting/btn';
import TextInput from '../../../base/interacting/text-input';
import Accordion from '../accordion';
import Checkbox from '../../../base/interacting/checkbox';
import TreeList, { TreeListItem } from '../tree-list';
import Size from '../../../base/visualizing/size';

import translations from './translations.json';
import './search-sidebar.scss';

import StoreContext from '../../../../store/StoreContext';

const SearchSidebar: FC = () => {
  const { globalSearch, ui } = useContext(StoreContext);

  const { t } = ui.useTranslation('SearchSidebar', translations);

  const hits = globalSearch.result?.meta.hits ?? 0;
  const title = useState('*');
  const catalogWorkReferenceNumber = useState('*');
  const location = useState('*');
  const cdaIDInventorynumber = useState('*');
  const catalogWorkReferenceNames = 'Friedländer, Rosenberg (1978)';

  const filterInfos = globalSearch.result?.filters ?? [];

  const mapFilterInfosToTreeList = (filters: typeof filterInfos): TreeListItem[] => filters.map((filter) => ({
    id: filter.id,
    name: filter.text,
    children: mapFilterInfosToTreeList(filter.children),
    data: {
      count: filter.doc_count,
    },
  }));

  const mappedFiltersInfos = mapFilterInfosToTreeList(filterInfos);

  const toggleFilterInfoActiveStatus = (filterInfoId: string) => {
     globalSearch.toggleFilterInfoActiveStatus(filterInfoId);
  };

  return (
    <div
      className="search-sidebar"
      data-component="structure/interacting/search-sidebar"
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
                      (item, toggle) => (<span className="filter-info-item">
                        <Checkbox
                          className="filter-info-item__checkbox"
                          checked={ globalSearch.filters.filterInfos.has(item.id) }
                          onChange={ () => toggleFilterInfoActiveStatus(item.id) }
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

export default observer(SearchSidebar);
