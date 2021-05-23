import React, { FC, useContext, useState } from 'react';

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
}) => {

  const { collection } = useContext(StoreContext);

  let isStoredFavorite = collection?.artefacts.includes(id);
  const [isFavorite, setFavorite] = useState(!!isStoredFavorite);

  const toggleFav = () => {
    if (isFavorite) {
      collection?.removeArtefactFromCollection(id);
    } else {
      collection?.addArtefactToCollection(id);
    }
    setFavorite(!isFavorite);
  };

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
              <p className="artefact-card__smalltext">{id}</p>
            </a>
            <a
              className={`artefact-card__favorite ${isFavorite ? 'artefact-card__favorite--is-active' : ''}` }
              onClick={toggleFav}
            ></a>
          </div>
        )
      }
    </div>
  );
};

export default ArtefactCard;
