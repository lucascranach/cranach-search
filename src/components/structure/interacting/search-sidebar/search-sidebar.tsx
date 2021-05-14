import React, { useState, useContext } from 'react';
import { observer } from 'mobx-react-lite';


import Btn from '../../../base/interacting/btn';
import TextInput from '../../../base/interacting/text-input';
import Accordion from '../accordion';

import translations from './translations.json';
import './search-sidebar.scss';

import StoreContext from '../../../../store/StoreContext';

type Translations = {
  de: Record<string, string>
};

const SearchSidebar = () => {
  const useTranslation = (_: string, translations: Translations) => ( { t: (key: string, _?: Record<string, string>) => translations.de[key] } );

  const { t } = useTranslation('SearchSidebar', translations);
  const { globalSearch } = useContext(StoreContext);

  const hits = globalSearch?.hits;
  const title = useState('*');
  const catalogWorkReferenceNumber = useState('*');
  const location = useState('*');
  const cdaIDInventorynumber = useState('*');
  const catalogWorkReferenceNames = 'Friedländer, Rosenberg (1978)';

  return (
    <div
      className="search-sidebar"
      data-component="structure/interacting/search-sidebar"
    >
      <div className="search-result-info">
        <h2>
          {hits < 2 && `${hits} ${t('works found')}`}
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
          <Accordion.Entry title={ t('Attribution') } toggle={ useState<boolean>(false) }>
            Attribution
          </Accordion.Entry>

          <Accordion.Entry title={ t('Kind') } toggle={ useState<boolean>(false) }>
            Kind
          </Accordion.Entry>

          <Accordion.Entry title={ t('Dating') } toggle={ useState<boolean>(false) }>
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

          <Accordion.Entry title={ t('Collection / Location') } toggle={ useState<boolean>(false) }>
            Collection / Location
          </Accordion.Entry>

          <Accordion.Entry title={ t('Examination Techniques') } toggle={ useState<boolean>(false) }>
            Examination Techniques
          </Accordion.Entry>

          <Accordion.Entry title={ t('Content') } toggle={ useState<boolean>(false) }>
            Content
          </Accordion.Entry>

          <Accordion.Entry title={ t('Form') } toggle={ useState<boolean>(false) }>
            Form
          </Accordion.Entry>

          <Accordion.Entry title={ t('Function') } toggle={ useState<boolean>(false) }>
            Function
          </Accordion.Entry>

          <Accordion.Entry title={ t('Constituents') } toggle={ useState<boolean>(false) }>
            Constituents
          </Accordion.Entry>
        </Accordion>
      </fieldset>
    </div>
  );
};

export default observer(SearchSidebar);
