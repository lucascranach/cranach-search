import React, { FC, useContext, useState } from 'react';

import { observer } from 'mobx-react-lite';

import Image from '../../../base/visualizing/image';
import StoreContext from '../../../../store/StoreContext';

import './artefact-card.scss';

type Props = {
  id?: string,
  title?: string,
  subtitle?: string,
  date?: string,
  to?: string,
  imgSrc?: string,
  imgAlt?: string,
  classification?: string,
  openInNewWindow?: boolean,
}


const ArtefactCard: FC<Props> = ({
  id = '',
  title = '',
  subtitle = '',
  date = '',
  to = '',
  imgSrc = '',
  imgAlt = '',
  classification = '',
  openInNewWindow = false,
}) => {
  const { collection } = useContext(StoreContext);

  let isStoredFavorite = !!(collection.artefacts.includes(id));

  const toggleFav = () => {
    if (isStoredFavorite) {
      collection.removeArtefactFromCollection(id);
    } else {
      collection.addArtefactToCollection(id);
    }
  };

  return(
    <div
      className="artefact-card"
      data-component="structure/visualizing/artefact-card"
    >
      <div className="card-image">
        <a
          href={to}
          target={openInNewWindow ? '_blank' : ''}
          rel={ 'noopener noreferrer' }
        >
          <Image
            src={imgSrc}
            alt={imgAlt}
            modifierWithBox={true}
          />
        </a>
      </div>
      {id
        && (
          <div className="artefact-card__content">
            <a
              href={to}
              target={ openInNewWindow ? '_blank' : '' }
              rel={ 'noopener noreferrer' }
            >
              <h2 className="artefact-card__title">{title}, {date}</h2>
              <p className="artefact-card__subtitle">{classification}</p>
              <p className="artefact-card__subtitle">{subtitle}</p>
              <p className="artefact-card__smalltext">{id}</p>
            </a>
            <a
              className={`artefact-card__favorite ${isStoredFavorite ? 'artefact-card__favorite--is-active' : ''}` }
              onClick={toggleFav}
            ></a>
          </div>
        )
      }
    </div>
  );
};

export default observer(ArtefactCard);
