import React, { FC, ReactNode } from 'react';

import './image.scss';

type Props = {
  src: string,
  alt?: string,
  caption?: ReactNode | ReactNode[],
  className?: string,
  modifierWithBox?: boolean,
  isLazy?: boolean,
};

const Image: FC<Props> = ({
  src,
  alt = '',
  caption,
  className,
  modifierWithBox = false,
  isLazy = true,
}) => {
  const classNameModifier = modifierWithBox ? '--with-box' : '';
  const capArray = (Array.isArray(caption) ? caption : [caption]);
  const captions = caption ? capArray : [];
  const innerClassName = `image${classNameModifier} ${className ? className : ''}`;

  return (
    <figure
      className={innerClassName}
      data-component="base/visualizing/image"
    >
      <div
        className="image__holder"
      >
        <img
          src={src}
          alt={alt}
          loading={ isLazy ? 'lazy' : 'eager' }
        />
      </div>

      {caption && <figcaption
        className='image__caption'
      >{captions}
      </figcaption>
      }
    </figure>
  );
};

export default Image;
