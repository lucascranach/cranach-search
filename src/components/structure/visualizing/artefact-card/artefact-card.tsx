import React, { FC, useContext, useEffect } from 'react';

import { observer } from 'mobx-react-lite';

import Image from '../../../base/visualizing/image';
import StoreContext from '../../../../store/StoreContext';

import './artefact-card.scss';

type Props = {
  id?: string,
  title?: string,
  subtitle?: string,
  text?: string,
  to?: string,
  sortInfoYear?: number,
  sortInfoPosition?: number,
  sortNumber?: string,
  imgSrc?: string,
  imgAlt?: string,
  openInNewWindow?: boolean,
}


const ArtefactCard: FC<Props> = ({
  id = '',
  title = '',
  subtitle = '',
  text = '',
  to = '',
  sortInfoYear = '',
  sortInfoPosition = '',
  sortNumber = '',
  imgSrc = '',
  imgAlt = '',
  openInNewWindow = false,
}) => {

  const { root: { collection } } = useContext(StoreContext);

  let isStoredFavorite = !!(collection.collectionIncludesArtefact(id));

  const toggleFav = () => {
    if (isStoredFavorite) {
      collection.removeArtefactFromCollection(id);
    } else {
      collection.addArtefactToCollection(id);
    }
  };

  const bookmarkIcon = isStoredFavorite ? 'remove' : 'add';

  const armFavIcons = () => {
    const favIcons = document.querySelectorAll(".artefact-card__favorite");
    favIcons.forEach(item => {
      item.classList.add("artefact-card__favorite--is-armed");
    });
  }

  useEffect(() => {
    const timer = setTimeout(() => { armFavIcons();}, 1000);
    return () => clearTimeout(timer);
  }, []);

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
              <h2 className="artefact-card__title" dangerouslySetInnerHTML={{__html: title}}></h2>
              <p className="artefact-card__subtitle">{subtitle}</p>
            <p className="artefact-card__text">{text}</p>
            <p className="artefact-card__text">Entry: {sortNumber}</p>
            <p className="artefact-card__text">Calc: {sortInfoYear}{sortInfoPosition}</p>
            </a>

          </div>
        )
      }
    </div>
  );
};

export default observer(ArtefactCard);
