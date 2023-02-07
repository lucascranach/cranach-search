import React, { FC, useEffect, useState } from 'react';

import Image from '../../../base/visualizing/image';

import './artefact-line.scss';

export type Props = {
  id?: string,
  title?: string,
  subtitle?: string,
  to?: string,
  text?: string,
  additionalText?: Array<string>,
  imgSrc?: string,
  imgAlt?: string,
  isFavorite?: boolean,
  onFavoriteToggle?: () => void,
}

const ArtefactLine: FC<Props> = ({
  id = '',
  title = '',
  subtitle = '',
  to = '',
  text = '',
  additionalText = [],
  imgSrc = '',
  imgAlt = '',
  isFavorite = null,
  onFavoriteToggle = (() => {}),
}) => {

  const additionalTextString = additionalText.map((item, index) => (<p key={index} className="artefact-line__text">{item}</p>));

  const [isArmed, setIsArmed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { setIsArmed(true); }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (<div
    className="artefact-line"
    data-component="structure/visualizing/artefact-line"
    data-artefact-id={id}
  >
    <div className="artefact-line__image">
      <a href={to}>
        <Image
          src={imgSrc}
          alt={imgAlt}
          modifierWithBox={true} // -has-box artefact-line-image
        />
      </a>
    </div>

    <div className="artefact-line__content">
      <a href={to}>
        <h2 className="artefact-line__title" dangerouslySetInnerHTML={{ __html: title }}></h2>
        <h3 className="artefact-line__subtitle">{subtitle}</h3>
        <p className="artefact-line__text">{text}</p>
        {additionalTextString}
      </a>
      {(isFavorite !== null) && (<a
          className={`artefact-line__favorite icon ${isFavorite ? 'artefact-line__favorite--is-active' : ''}  ${isArmed ? 'artefact-line__favorite--is-armed' : ''}`}
          onClick={onFavoriteToggle || (() => {})}
        >{isFavorite ? 'remove' : 'add'}</a>)}
    </div>

  </div>);
};

export default ArtefactLine;
