import React, { FC } from 'react';

import Image from '../../../base/visualizing/image';

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
  id='',
  title = '',
  subtitle = '',
  date = '',
  to = '',
  imgSrc = '',
  imgAlt = '',
  classification = '',
}) => (
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
            </a>
          </div>
        )
      }
    </div>
);

export default ArtefactCard;
