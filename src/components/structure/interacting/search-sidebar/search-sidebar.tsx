import React, { FC, useState, useContext } from 'react';
import { observer } from 'mobx-react-lite';


import Btn from '../../../base/interacting/btn';
import TextInput from '../../../base/interacting/text-input';
import Accordion from '../accordion';
import Checkbox from '../../../base/interacting/checkbox';
import TreeList, { TreeListItem } from '../tree-list';

import translations from './translations.json';
import './search-sidebar.scss';

import StoreContext from '../../../../store/StoreContext';

type Translations = {
  de: Record<string, string>
};

const SearchSidebar: FC = () => {
  const useTranslation = (_: string, translations: Translations) => ( { t: (key: string, _?: Record<string, string>) => translations.de[key] || key } );

  const { t } = useTranslation('SearchSidebar', translations);
  const { globalSearch } = useContext(StoreContext);

  const hits = globalSearch?.result?.meta.hits ?? 0;
  const title = useState('*');
  const catalogWorkReferenceNumber = useState('*');
  const location = useState('*');
  const cdaIDInventorynumber = useState('*');
  const catalogWorkReferenceNames = 'Friedländer, Rosenberg (1978)';

  const thesaurusFilters = globalSearch?.result?.filters.thesaurus ?? [];

  const mapThesaurusFiltersToTreeList = (filters: typeof thesaurusFilters): TreeListItem[] => filters.map((filter) => ({
    id: filter.id,
    name: filter.name,
    children: mapThesaurusFiltersToTreeList(filter.children),
    data: {
      count: filter.count,
    },
  }));

  const mappedThesaurusFilters = mapThesaurusFiltersToTreeList(thesaurusFilters);

  const toggleThesaurusFilterActiveStatusForId = (filterId: string) => {
     globalSearch?.toggleThesaurusFilterActiveStatus(filterId);
  };

  return (
    <div
      className="search-sidebar"
      data-component="structure/interacting/search-sidebar"
    >
      <div className="search-result-info">
        <h2>
          {hits < 2 && `${hits} ${t('work found')}`}
          {hits >= 2 && `${hits} ${t('works found')}`}
        </h2>
      </div>
      <fieldset className="block">
        <TextInput
          className="search-input"
          label={ t('all Fields') }
          value={ globalSearch?.allFieldsTerm }
          onChange={ term => globalSearch?.searchForAllFieldsTerm(term) }
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
          <Accordion.Entry title={ t('Attribution') }>
            Attribution
          </Accordion.Entry>

          <Accordion.Entry title={ t('Kind') }>
            Kind
          </Accordion.Entry>

          <Accordion.Entry title={ t('Dating') }>
            <div className="cell-row">
              <div className="cell">
                <TextInput
                  className="dating-field"
                  value={ globalSearch?.filters.dating.from }
                  placeholder="Von"
                  onChange={ (date) => globalSearch?.setDatingFrom(date) }
                ></TextInput>
              </div>

              <div className="cell">
                -
              </div>

              <div className="cell">
                <TextInput
                  className="dating-field"
                  value={ globalSearch?.filters.dating.to }
                  placeholder="Bis"
                  onChange={ (date) => globalSearch?.setDatingTo(date) }
                ></TextInput>
              </div>
            </div>
          </Accordion.Entry>

          <Accordion.Entry title={ t('Collection / Location') }>
            Collection / Location
          </Accordion.Entry>

          <Accordion.Entry title={ t('Examination Techniques') }>
            Examination Techniques
          </Accordion.Entry>


          { mappedThesaurusFilters.map(
              (item) => {
                return (<Accordion.Entry key={ item.id } title={ item.name }>
                  <TreeList
                    items={ item?.children ?? [] }
                    wrapComponent={
                      (item, toggle) => (<span className="thesaurus-filter-item">
                        <Checkbox
                          className="thesaurus-filter-item__checkbox"
                          checked={ globalSearch?.filters.thesaurus.has(item.id) }
                          onChange={ () => toggleThesaurusFilterActiveStatusForId(item.id) }
                        />
                        <span
                          className="thesaurus-filter-item__name"
                          data-count={ item.data?.count }
                          onClick={ toggle }
                        >{ item.name }</span>
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
