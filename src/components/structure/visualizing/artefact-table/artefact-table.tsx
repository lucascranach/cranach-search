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
      forceColumnTextWrap?: boolean,
      asInnerHTML?: boolean,
    },
  }[],
  items: ItemProp[],
  options?: {
    showImageColumn?: boolean,
    enableFavorite?: boolean,
  }
  onFavoriteToggle: (id: string) => void,
}

const ArtefactTable: FC<Props> = ({
  head,
  items,
  options = {
    showImageColumn: true,
    enableFavorite: true,
  },
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
        { options?.showImageColumn && <th scope="col"></th> }
        { head.map((headItem) => (<th key={headItem.fieldName} scope="col">{headItem.text}</th>)) }
        <th></th>
      </tr>
    </thead>
    <tbody>
      {
        items.map((item) => {
          return (
            <tr key={item.id}>
              {
                options?.showImageColumn && <td
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
              }
              {
                head.map((headItem) => (
                  <td key={headItem.fieldName} className={headItem.options?.noWrap ? 'no-wrap' : ''}>
                    {
                      headItem.options?.asInnerHTML
                      ? (<span
                        className={`text-value ${headItem.options?.forceColumnTextWrap ? 'wrap' : ''}`}
                        dangerouslySetInnerHTML={{ __html: item[headItem.fieldName].toString() }}
                        ></span>)
                      : (<span
                        className={`text-value ${headItem.options?.forceColumnTextWrap ? 'wrap' : ''}`}
                        >
                          { item[headItem.fieldName] }
                        </span>)
                    }
                  </td>)
                )
              }
              <td className="artefact-table__favorite">
                {
                  options?.enableFavorite && <div className="favorite-holder">
                    <a
                      className={`favorite icon ${item.isFavorite ? 'favorite--is-active' : ''} ${isArmed ? 'favorite--is-armed' : ''}`}
                      onClick={() => { onFavoriteToggle(item.id) }}
                    >{item.isFavorite ? 'remove' : 'add'}</a>
                  </div>
                }
              </td>
            </tr>
          );
        })
      }
    </tbody>
  </table>);
};

export default ArtefactTable;
