import React, { FC, useEffect, useState } from 'react';

import Image from '../../../base/visualizing/image';

import './artefact-table.scss';


interface ItemProp {
  id: string;
  to: string;
  imgSrc: string;
  imgAlt: string;
  isFavorite: boolean;
  [key: string]: string | boolean;
}

export type Props = {
  head: {
    fieldName: string,
    text: string,
    options?: {
      noWrap?: boolean,
    },
  }[],
  items: ItemProp[],
  onFavoriteToggle: (id: string) => void,
}

const ArtefactTable: FC<Props> = ({
  head,
  items,
  onFavoriteToggle,
}) => {

  const [isArmed, setIsArmed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { setIsArmed(true); }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (<table
    className="artefact-table"
    data-component="structure/visualizing/artefact-table"
  >
    <thead>
      <tr>
        <th scope="col"></th>
        { head.map((headItem) => (<th scope="col">{headItem.text}</th>)) }
        <th></th>
      </tr>
    </thead>
    <tbody>
      {
        items.map((item) => {
          return (
            <tr>
              <td
                scope="row"
                className="artefact-table__image-field"
              >
                <a href={item.to}>
                  <Image
                    src={item.imgSrc || ''}
                    alt={item.imgAlt}
                    modifierWithBox={true} // -has-box artefact-line-image
                  />
                </a>
              </td>
              {
                head.map((headItem) => (<td className={headItem.options?.noWrap ? 'no-wrap' : ''}>{ item[headItem.fieldName] }</td>))
              }
              <td className="artefact-table__favorite">
                  <div className="favorite-holder">
                    <a
                      className={`favorite icon ${item.isFavorite ? 'favorite--is-active' : ''} ${isArmed ? 'favorite--is-armed' : ''}`}
                      onClick={() => { onFavoriteToggle(item.id) }}
                    >{item.isFavorite ? 'remove' : 'add'}</a>
                  </div>
              </td>
            </tr>
          );
        })
      }
    </tbody>
  </table>);
};

export default ArtefactTable;
