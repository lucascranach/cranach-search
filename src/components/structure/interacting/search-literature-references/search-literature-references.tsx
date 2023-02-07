import React, { FC, useContext, KeyboardEvent } from 'react';
import { observer } from 'mobx-react-lite';

import Btn from '../../../base/interacting/btn';
import TextInput from '../../../base/interacting/text-input';
import Size from '../../../base/visualizing/size';
import Logo from '../../../base/visualizing/logo';
import Toggle from '../../../base/interacting/toggle';

import translations from './translations.json';
import './search-literature-references.scss';

import StoreContext, {
  UISidebarContentType,
  UISidebarStatusType,
} from '../../../../store/StoreContext';

const SearchArchivals: FC = () => {
  const { root: { lighttable, searchLiteratureReferences, ui } } = useContext(StoreContext);

  const { t } = ui.useTranslation('Search', translations);

  const hits = lighttable.result?.meta.hits ?? 0;

  const isActiveFilter = ui.sidebarStatus === UISidebarStatusType.MAXIMIZED && ui.sidebarContent === UISidebarContentType.FILTER
    ? 'search-literature-references--is-active'
    : '';

  const triggerFilterRequest = () => {
    searchLiteratureReferences.applyFreetextFields();
    searchLiteratureReferences.triggerFilterRequest();
  }

  const triggerFilterRequestOnEnter = (e: KeyboardEvent) => {
    if ((e.code && e.code === 'Enter') || (e.keyCode === 13)) {
      triggerFilterRequest();
    }
  }

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
        </Toggle>

        <Btn
          className="search-button"
          icon="search"
          click={ triggerFilterRequest }
        >{ t('find') }</Btn>

      </fieldset>
    </div>
  );
};

export default observer(SearchArchivals);
