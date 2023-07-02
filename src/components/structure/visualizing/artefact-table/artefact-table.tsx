import React, { FC, useEffect, useState, ReactNode } from 'react';

import Image from '../../../base/visualizing/image';

import './artefact-table.scss';

export type ArtefactTableSortingDirection = 'asc' | 'desc' | null;

interface ItemProp {
  id: string;
  to: string;
  imgSrc: string;
  imgAlt: string;
  isFavorite: boolean;
  [key: string]: string | boolean;
}

export interface Props {
  head: {
    fieldName: string,
    text: string,
    options?: {
      noWrap?: boolean,
      noWrapHead?: boolean,
      forceColumnTextWrap?: boolean,
      asInnerHTML?: boolean,
      sort?: ArtefactTableSortingDirection | null,
    },
  }[],
  items: ItemProp[],
  options?: {
    showImageColumn?: boolean,
    enableFavorite?: boolean,
    hideEmptyColumns?: boolean,
  },
  onSortChange?: (fieldName: string, direction: ArtefactTableSortingDirection | null) => void,
  onFavoriteToggle: (id: string) => void,
}

const ArtefactTable: FC<Props> = ({
  head,
  items,
  options,
  onSortChange,
  onFavoriteToggle,
}) => {
  const [isArmed, setIsArmed] = useState(false);

  const defaultOptions = {
    showImageColumn: true,
    enableFavorite: true,
    hideEmptyColumns: true,
  };

  const customOptions = { ...defaultOptions, ...options };

  const fieldNames = head.map((headItem) => headItem.fieldName);
  const nonEmptyFieldNames = fieldNames.filter((fieldName) => {
    return !items.every((item) => item[fieldName] === '');
  });

  const reducedHead = customOptions.hideEmptyColumns === true
    ? head.filter((headItem) => nonEmptyFieldNames.includes(headItem.fieldName))
    : head;

  useEffect(() => {
    const timer = setTimeout(() => { setIsArmed(true); }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const redirectToItem = (item: ItemProp, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).tagName !== 'A' ) {
      window.location.href = item.to;
    }
  };

  return (<table
    className="artefact-table"
    data-component="structure/visualizing/artefact-table"
  >
    <thead>
      <tr>
        { customOptions.showImageColumn && <th scope="col"></th> }
        { reducedHead.map((headItem) => (<th
            className={ [
              headItem.options?.noWrapHead ? 'no-wrap' : '',
              headItem.options?.sort !== undefined ? 'is-sortable': '',
            ].join(' ') }
            key={headItem.fieldName}
            scope="col"
            onClick={
              (headItem.options?.sort !== undefined && onSortChange)
                ? () => onSortChange(
                    headItem.fieldName,
                    headItem.options?.sort || null,
                  )
                : () => {}
            }
          >
          {headItem.text}
          {
            headItem.options?.sort !== undefined && <div
              className={[
                'sort',
                headItem.options?.sort ? `sort--${headItem.options.sort}` : ''
              ].join(' ')}
            >
              <div className="sort__asc"></div>
              <div className="sort__desc"></div>
            </div>
          }
        </th>)) }
        { customOptions.enableFavorite && <th></th> }
      </tr>
    </thead>
    <tbody>
      {
        items.map((item) => {
          return (
            <tr key={item.id} onClick={ (event) => redirectToItem(item, event) }>
              {
                customOptions.showImageColumn && <td
                  scope="row"
                  className="artefact-table__image-field"
                >
                  <Image
                    src={item.imgSrc || ''}
                    alt={item.imgAlt}
                    modifierWithBox={true} // -has-box artefact-line-image
                  />
                </td>
              }
              {
                reducedHead.map((headItem) => (
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
              {
                customOptions.enableFavorite && (<td className="artefact-table__favorite">
                  <div className="favorite-holder">
                    <a
                      className={`favorite icon ${item.isFavorite ? 'favorite--is-active' : ''} ${isArmed ? 'favorite--is-armed' : ''}`}
                      onClick={() => { onFavoriteToggle(item.id) }}
                    >{item.isFavorite ? 'remove' : 'add'}</a>
                  </div>
                </td>)
              }
            </tr>
          );
        })
      }
    </tbody>
  </table>);
};

export default ArtefactTable;
