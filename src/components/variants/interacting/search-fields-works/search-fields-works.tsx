import React, { FC, useContext, KeyboardEvent, useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import TextInput from '../../../base/interacting/text-input';
import { TreeListItem } from '../../../structure/interacting/tree-list';
import Toggle from '../../../base/interacting/toggle';

import translations from './translations.json';
import './search-fields-works.scss';

import StoreContext, {
  GlobalSearchFilterItem,
} from '../../../../store/StoreContext';

const SearchFieldsWorks: FC = () => {
  const { root: { globalSearch, ui } } = useContext(StoreContext);

  const { t } = ui.useTranslation('Search', translations);

  const catalogWorkReferenceNames = 'Friedländer, Rosenberg (1978)';

  const mapFilterItemToTreeList = (filters: GlobalSearchFilterItem[], groupKey: string): TreeListItem[] => filters.map((filter) => ({
    id: filter.id,
    name: filter.text,
    children: mapFilterItemToTreeList(filter.children, groupKey),
    data: {
      count: filter.doc_count,
      groupKey,
    },
  }));

  const triggerFilterRequest = () => {
    globalSearch.applyFreetextFields();
    globalSearch.triggerFilterRequest();
  }

  const triggerFilterRequestOnEnter = (e: KeyboardEvent) => {
    if ((e.code && e.code === 'Enter') || (e.keyCode === 13)) {
      triggerFilterRequest();
    }
  }

  return (
    <Toggle
      className="search-fields-works"
      isOpen={ui.additionalSearchInputsVisible}
      title={t('Advanced Search')}
      onToggle={ () => ui.setAdditionalSearchInputsVisible(!ui.additionalSearchInputsVisible) }
    >

      <TextInput
        className="search-input"
        label={ t('Title') }
        value={ globalSearch.freetextFields.title }
        onChange={ title => globalSearch.setFreetextFields({ title }) }
        onKeyDown={ triggerFilterRequestOnEnter }
        onReset={ triggerFilterRequest }
        resetable={true}
      ></TextInput>

      <TextInput
        className="search-input"
        label={ t('{{catalogWorkReferenceNames}} No.', { catalogWorkReferenceNames }) } value={ globalSearch.freetextFields.FRNr }
        onChange={ FRNr => globalSearch.setFreetextFields({ FRNr }) }
        onKeyDown={ triggerFilterRequestOnEnter }
        onReset={ triggerFilterRequest }
        resetable={true}
      ></TextInput>

      <TextInput
        className="search-input"
        label={ t('Location') }
        value={ globalSearch.freetextFields.location }
        onChange={ location => globalSearch.setFreetextFields({ location }) }
        onKeyDown={ triggerFilterRequestOnEnter }
        onReset={ triggerFilterRequest }
        resetable={true}
      ></TextInput>

      <TextInput
        className="search-input"
        label={ t('CDA ID / Inventorynumber') }
        value={ globalSearch.freetextFields.inventoryNumber }
        onChange={ inventoryNumber => globalSearch.setFreetextFields({ inventoryNumber }) }
        onKeyDown={ triggerFilterRequestOnEnter }
        onReset={ triggerFilterRequest }
        resetable={true}
      ></TextInput>
    </Toggle>
  );
};

export default observer(SearchFieldsWorks);
