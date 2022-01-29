import React, { FC } from 'react';

import Image from '../../../base/visualizing/image';

import './artefact-line.scss';

type Props = {
  title?: string,
  subtitle?: string,
  date?: string,
  to?: string,
  text?: string,
  additionalText?: Array<string>,
  imgSrc?: string,
  imgAlt?: string,
}

const ArtefactLine: FC<Props> = ({
  title = '',
  subtitle = '',
  date = '',
  to = '',
  text = '',
  additionalText = [],
  imgSrc = '',
  imgAlt = '',
}) => {

  const additionalTextString = additionalText.map(item => (<p className="artefact-line__text">{item}</p>));

  return (<div
    className="artefact-line"
    data-component="structure/visualizing/artefact-line"
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
    </div>

  </div>);
};

export default ArtefactLine;
