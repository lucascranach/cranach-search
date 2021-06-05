import React, { FC, useContext } from 'react';

import { observer } from 'mobx-react-lite';

import Image from '../../../base/visualizing/image';
import StoreContext from '../../../../store/StoreContext';

import './artefact-card.scss';

type Props = {
  id?: string,
  slug?:string,
  title?: string,
  subtitle?: string,
  date?: string,
  to?: string,
  imgSrc?: string,
  imgAlt?: string,
  classification?: string,
}


const ArtefactCard: FC<Props> = ({
  id = '',
  slug='',
  title = '',
  subtitle = '',
  date = '',
  to = '',
  imgSrc = '',
  imgAlt = '',
  classification = '',
}) => {
  const { collection } = useContext(StoreContext);

  let isStoredFavorite = !!(collection?.artefacts.includes(slug));

  const toggleFav = () => {
    if (isStoredFavorite) {
      collection?.removeArtefactFromCollection(slug);
    } else {
      collection?.addArtefactToCollection(slug);
    }
  };

  const bookmarkIcon = isStoredFavorite ? 'bookmark_remove' : 'bookmark_add';

  return(
    <div
      className="artefact-card"
      data-component="structure/visualizing/artefact-card"
    >
      <div className="card-image">
        <a href={to}>
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
            <a href={to}>
              <h2 className="artefact-card__title">{title}, {date}</h2>
              <p className="artefact-card__subtitle">{classification}</p>
              <p className="artefact-card__subtitle">{subtitle}</p>
            <p className="artefact-card__smalltext">{slug}</p>
            </a>
            <a
              className={`artefact-card__favorite icon ${isStoredFavorite ? 'artefact-card__favorite--is-active' : ''}` }
              onClick={toggleFav}
          >{bookmarkIcon}</a>
          </div>
        )
      }
    </div>
  );
};

export default observer(ArtefactCard);
