import React, { FC, useEffect, useState } from 'react';

import Image from '../../../base/visualizing/image';

import './artefact-card.scss';

export type Props = {
  id?: string,
  title?: string,
  subtitle?: string,
  text?: string,
  to?: string,
  imgSrc?: string,
  imgAlt?: string,
  openInNewWindow?: boolean,
  isFavorite?: boolean,
  onFavoriteToggle?: () => void,
}


const ArtefactCard: FC<Props> = ({
  id = '',
  title = '',
  subtitle = '',
  text = '',
  to = '',
  imgSrc = '',
  imgAlt = '',
  openInNewWindow = false,
  isFavorite = null,
  onFavoriteToggle = (() => {}),
}) => {
  const [isArmed, setIsArmed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { setIsArmed(true); }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="artefact-card"
      data-component="structure/visualizing/artefact-card"
      data-artefact-id={id}
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
        {(isFavorite !== null) && (<a
          className={`artefact-card__favorite icon ${isFavorite ? 'artefact-card__favorite--is-active' : ''} ${isArmed ? 'artefact-card__favorite--is-armed' : ''}`}
          onClick={onFavoriteToggle || (() => {})}
        >{isFavorite ? 'remove' : 'add'}</a>)}
      </div>
      {(id && (title || subtitle || text))
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
            </a>

          </div>
        )
      }
    </div>
  );
};

export default ArtefactCard;
