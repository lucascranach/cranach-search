import React, { FC, useContext } from 'react';

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

  let isFav = collection?.artefacts.includes(id);

  const setFavorite = (id: string) => {
    if (isFav) {
      collection?.removeArtefactFromCollection(id);
    } else {
      collection?.addArtefactToCollection(id);
    }
    isFav = !isFav;
  }


  const getClassName = (id: string) => {
    const additionalClass = isFav ? ' artefact-card__favorite--is-active' : '';
    return `artefact-card__favorite ${additionalClass}`;
  }

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
              className={getClassName(id)}
              onClick={() => setFavorite(id) }
          ><i className="icon"></i>
            </a>
          </div>
        )
      }
    </div>
  );
};

export default ArtefactCard;
