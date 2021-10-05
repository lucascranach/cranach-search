import React, { FC } from 'react';

import Switcher from '../../../base/interacting/switcher';
import ArtefactCard from '../artefact-card';
import ArtefactLine from '../artefact-line';

import { GlobalSearchEntityType } from '../../../../store/StoreContext';

import './artefact-overview.scss';

export type ArtefactOverviewItem = {
  id: string;
  entityType: string;
  objectName: string;
  title: string;
  owner: string;
  date: string;
  additionalInfoList: string[];
  classification: string;
  imgSrc: string;
  entityTypeShortcut: string;
  to: string;
  openInNewWindow: boolean;
};

export enum ArtefactOverviewType {
  CARD = 'card',
  CARD_SMALL = 'card_small',
  LIST = 'list',
}

type OverviewProps = {
  items?: ArtefactOverviewItem[],
  viewType?: ArtefactOverviewType,
}

type SwitcherProps = {
  viewType?: ArtefactOverviewType,
  handleChange?: (view: ArtefactOverviewType) => void,
  className?: string,
}

const DefaultViewType = ArtefactOverviewType.CARD;

const ArtefactOverview: FC<OverviewProps> & { Switcher: FC<SwitcherProps> } = ({
  items = [],
  viewType = DefaultViewType,
}) => {

  const shortenTitle = (title: string) => {
    const splitTitle = title.split(' ');
    return splitTitle.length < 25 ? title : `${splitTitle.slice(0, 24).join(' ')} ...`;
  };

  return (<div
    className="artefact-overview"
    data-component="structure/visualizing/artefact-overview"
    data-active-view={viewType}
  >
    {
      items.map(item => (<div
        key={item.id}
        className="overview-item"
      >
        {ArtefactOverviewType.CARD === viewType && <ArtefactCard
          id={item.id}
          storageSlug={`${item.id}:${item.objectName}:${item.entityTypeShortcut}`}
          title={shortenTitle(item.title)}
          subtitle={item.date}
          text={item.entityType === GlobalSearchEntityType.PAINTINGS ? item.owner : item.classification}
          to={item.to}
          classification={item.classification}
          imgSrc={item.imgSrc || ''}
          openInNewWindow={item.openInNewWindow}
        />
        }

        {ArtefactOverviewType.CARD_SMALL === viewType && <ArtefactCard
          to={item.to}
          storageSlug={`${item.id}:${item.objectName}:${item.entityTypeShortcut}`}
          imgSrc={item.imgSrc || ''}
        />
        }

        {ArtefactOverviewType.LIST === viewType && <ArtefactLine
          title={shortenTitle(item.title)}
          subtitle={item.date}
          text={item.entityType === GlobalSearchEntityType.PAINTINGS ? item.owner : item.classification}
          additionalInfoList={item.additionalInfoList}
          to={item.to}
          imgSrc={item.imgSrc || ''}
        />
        }
      </div>
      ))
    }
  </div>
  );
};

ArtefactOverview.Switcher = ({
  viewType = DefaultViewType,
  handleChange = () => { },
  className = '',
}) => {

  const allViewEntries = [
    {
      type: ArtefactOverviewType.CARD,
      icon: 'view_column',
    },
    {
      type: ArtefactOverviewType.CARD_SMALL,
      icon: 'view_module',
    },
    {
      type: ArtefactOverviewType.LIST,
      icon: 'view_list',
    },
  ];

  return (<Switcher className={`artefact-overview-switcher ${className}`} >
    {allViewEntries.map(({ type, icon }) => (
      <Switcher.Item
        key={type}
      >
        <i
          className={`material-icons artefact-overview-switcher-item-icon ${(type === viewType) ? 'is-active' : ''}`}
          onClick={() => handleChange(type)}
        >{icon}</i>
      </Switcher.Item>
    ))}
  </Switcher>);
};

export default ArtefactOverview;
