import React, { FC, useRef, useEffect } from 'react';
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
  inventor: string;
  artist: string;
  date: string;
  dimensions: string;
  classification: string;
  printProcess: string;
  imgSrc: string;
  entityTypeShortcut: string;
  to: string;
  openInNewWindow: boolean;
  medium: string;
  _highlight?: Record<string, Array<string>>;
};

export enum ArtefactOverviewType {
  CARD = 'card',
  CARD_SMALL = 'card-small',
  LIST = 'list',
}

type OverviewProps = {
  items?: ArtefactOverviewItem[],
  viewType?: ArtefactOverviewType,
  handleArtefactAmountChange?: (amount: number) => void;
}

type SwitcherProps = {
  viewType?: ArtefactOverviewType,
  handleChange?: (view: ArtefactOverviewType) => void,
  className?: string,
}

const DefaultViewType = ArtefactOverviewType.CARD;
const maximumTitleLengthInWords = 10;

const ArtefactOverview: FC<OverviewProps> & { Switcher: FC<SwitcherProps> } = ({
  items = [],
  viewType = DefaultViewType,
  handleArtefactAmountChange = () => {},
}) => {
  const artefactOverviewElRef = useRef<HTMLDivElement | null>(null);
  const hasHighlightedText = (item: ArtefactOverviewItem, prop: keyof ArtefactOverviewItem): boolean => {
    return !!(item._highlight && item._highlight[prop])
  }

  const getAvailableHighlightExcerpt = (item: ArtefactOverviewItem, prop: keyof ArtefactOverviewItem) => {
    if (!(item._highlight && hasHighlightedText(item, prop))) return '';

    const ellipsis = '…';
    const highlightedText = item._highlight[prop][0];
    const splitHT = highlightedText.split(' ');

    const startIdx = splitHT.findIndex((seg) => seg.match('<em>'));
    const endIdx = splitHT.findIndex((seg) => seg.match('</em>'));

    const wordCntForPadding = 4;

    const preIdx = Math.max(0, startIdx - wordCntForPadding);
    const postIdx = Math.min(splitHT.length, endIdx + wordCntForPadding + 1);

    let slice = splitHT.slice(preIdx, postIdx - preIdx).join(' ');

    if (preIdx != 0) {
      slice = `${ellipsis} ${slice}`;
    }

    if (postIdx != splitHT.length) {
      slice = `${slice} ${ellipsis}`;
    }

    return slice;
  };
  const shortenTitle = (title: string): string => {
    const splitTitle = title.split(' ');
    return splitTitle.length <= maximumTitleLengthInWords ? title : `${splitTitle.slice(0, maximumTitleLengthInWords).join(' ')} …`;
  };

  const assembleTitleForCardView = (item: ArtefactOverviewItem): string => {
    const title = hasHighlightedText(item, 'title')
      ? getAvailableHighlightExcerpt(item, 'title') as string
      : shortenTitle(item.title);

    return `${title}, ${item.date}`;
  }

  const assembleTitleForListView = (item: ArtefactOverviewItem): string => {
    const title = hasHighlightedText(item, 'title')
      ? getAvailableHighlightExcerpt(item, 'title') as string
      : shortenTitle(item.title);

    return `${title}, ${item.date}`;
  }

  const assembleSubTitleForCardView = (item: ArtefactOverviewItem): string => {
    switch (item.entityType) {
      case GlobalSearchEntityType.ARCHIVALS:
        return 'tbd';
      case GlobalSearchEntityType.GRAPHICS:
        return `${item.classification}, ${item.printProcess}`;
    }
    return item.classification;
  }

  const assembleSubTitleForListView = (item: ArtefactOverviewItem): string => {
    switch (item.entityType) {
      case GlobalSearchEntityType.ARCHIVALS:
        return 'tbd';
      case GlobalSearchEntityType.GRAPHICS:
        return `${item.classification}, ${item.printProcess}`;
    }
    return item.medium;
  }

  const assembleTextForCardView = (item: ArtefactOverviewItem): string => {
    switch (item.entityType) {
      case GlobalSearchEntityType.ARCHIVALS:
        return 'tbd';
      case GlobalSearchEntityType.GRAPHICS:
        return `${item.inventor}`;
    }
    return `${item.owner}`;
  }

  const assembleTextForListView = (item: ArtefactOverviewItem): string => {
    return `${item.artist}`;
  }

  const assembleAdditionalText = (item: ArtefactOverviewItem): string => {
    const dimensions = item.dimensions ? item.dimensions : '';
    const dimensionList = dimensions.split(/\n/);
    return dimensionList[0];
  }

  const getSuitableAmountOfArtefacts = (elRef: HTMLElement) => {
    const baseFontSize = parseFloat(getComputedStyle(document.body).fontSize);
    const styles = getComputedStyle(document.documentElement);
    const tileSize = parseFloat(styles.getPropertyValue('--tile-xxs')) * baseFontSize;

    const artefactOverviewDimensions = {
      'width': elRef.clientWidth,
      'height': elRef.clientHeight
    };

    const safetyDistance = 1;
    const rows = Math.floor(artefactOverviewDimensions.height / tileSize) - safetyDistance;
    const cols = Math.floor(artefactOverviewDimensions.width / tileSize);
    return cols * rows;
  }

  useEffect(() => {
    if (!artefactOverviewElRef.current) return;

    if (viewType === ArtefactOverviewType.CARD_SMALL) {
      handleArtefactAmountChange(getSuitableAmountOfArtefacts(artefactOverviewElRef.current));
    }
  }, [viewType, artefactOverviewElRef]);

  return (<div
    ref={ artefactOverviewElRef }
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
          title={assembleTitleForCardView(item)}
          subtitle={assembleSubTitleForCardView(item)}
          text={assembleTextForCardView(item)}
          to={item.to}
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
          title={assembleTitleForListView(item)}
          subtitle={assembleSubTitleForListView(item)}
          text={assembleTextForListView(item)}
          additionalText={assembleAdditionalText(item)}
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
