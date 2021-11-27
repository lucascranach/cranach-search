import React, { FC, useContext } from 'react';

import { observer } from 'mobx-react-lite';

import Image from '../../../base/visualizing/image';
import StoreContext from '../../../../store/StoreContext';

import './artefact-card.scss';

type Props = {
  id?: string,
  storageSlug?: string,
  title?: string,
  subtitle?: string,
  text?: string,
  to?: string,
  imgSrc?: string,
  imgAlt?: string,
  openInNewWindow?: boolean,
}


const ArtefactCard: FC<Props> = ({
  id = '',
  storageSlug = '',
  title = '',
  subtitle = '',
  text = '',
  to = '',
  imgSrc = '',
  imgAlt = '',
  openInNewWindow = false,
}) => {

  const { root: { collection } } = useContext(StoreContext);

  let isStoredFavorite = !!(collection.artefacts.includes(storageSlug));

  const toggleFav = () => {
    if (isStoredFavorite) {
      collection.removeArtefactFromCollection(storageSlug);
    } else {
      collection.addArtefactToCollection(storageSlug);
    }
  };

  const bookmarkIcon = isStoredFavorite ? 'remove' : 'add';

  return (
    <div
      className="artefact-card"
      data-component="structure/visualizing/artefact-card"
    >
      <div className="card-image">
        <a
          href={to}
          target={openInNewWindow ? '_blank' : ''}
          rel={'noopener noreferrer'}
        >
          <Image
            src={imgSrc}
            alt={imgAlt}
            modifierWithBox={true}
          />
        </a>
        <a
          className={`artefact-card__favorite icon ${isStoredFavorite ? 'artefact-card__favorite--is-active' : ''}`}
          onClick={toggleFav}
        >{bookmarkIcon}</a>
      </div>
      {id
        && (
          <div className="artefact-card__content">
            <a
              href={to}
              target={openInNewWindow ? '_blank' : ''}
              rel={'noopener noreferrer'}
            >
              <h2 className="artefact-card__title">{title}</h2>
              <p className="artefact-card__subtitle">{subtitle}</p>
              <p className="artefact-card__text">{text}</p>
            </a>

          </div>
        )
      }
    </div>
  );
};

export default observer(ArtefactCard);
