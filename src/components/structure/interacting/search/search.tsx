import React, { FC, useContext, KeyboardEvent, useEffect, ReactNode } from 'react';
import { observer } from 'mobx-react-lite';

import Btn from '../../../base/interacting/btn';
import TextInput from '../../../base/interacting/text-input';
import Size from '../../../base/visualizing/size';
import Logo from '../../../base/visualizing/logo';

import translations from './translations.json';
import './search.scss';

import StoreContext from '../../../../store/StoreContext';

type Props = {
  isActive: boolean,
  customFields: ReactNode | false,
  customFilters: ReactNode | false,
};

const Search: FC<Props> = ({
  isActive = false,
  customFields = false,
  customFilters = false,
}) => {
  const { root: { globalSearch, ui } } = useContext(StoreContext);

  const { t } = ui.useTranslation('Search', translations);

  const filterCount = globalSearch.amountOfActiveFilters;
  const hits = globalSearch.result?.meta.hits ?? 0;

  const isActiveClassName = isActive ? 'search--is-active' : '';

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
    <div
      className={`search ${isActiveClassName}`}
      data-component="structure/interacting/search"
    >
      <Logo />
      <div className="search-result-info">
        {hits === 1 && <p><Size size={hits} /> {t('work found')}</p>}
        {(hits > 1 || hits === 0) && <p><Size size={hits} /> { t('works found') }</p>}
      </div>
      <fieldset className="block keyword-search">
        <TextInput
          placeholder={t('Enter Search Keyword')}
          className="search-input"
          value={ globalSearch.freetextFields.allFieldsTerm }
          onChange={ allFieldsTerm => globalSearch.setFreetextFields({ allFieldsTerm }) }
          onKeyDown={ triggerFilterRequestOnEnter }
          onReset={ triggerFilterRequest }
          resetable={true}
        ></TextInput>

        { customFields }

        <Btn
          className="search-button"
          icon="search"
          click={ triggerFilterRequest }
        >{ t('find') }</Btn>

      </fieldset>


      { !!customFilters &&
        <fieldset className="block">
          { customFilters }

          {filterCount > 0 &&
            <div className="sticky-panel">
              <Btn
                className="reset-button"
                icon="delete_sweep"
                click={ () => globalSearch.resetAllFilters() }
              >{ t('reset filters') }</Btn>
            </div>
          }
        </fieldset>
      }
    </div>
  );
};

export default observer(Search);
