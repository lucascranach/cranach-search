import React, { FC, useRef, useEffect, useContext } from 'react';
import Switcher from '../../../base/interacting/switcher';
import ArtefactCard from '../artefact-card';
import ArtefactLine from '../artefact-line';
import ArtefactTable, { Props as ArtefactTableProps } from '../artefact-table';

import { observer } from 'mobx-react-lite';

import StoreContext, { EntityType, UIArtifactKind } from '../../../../store/StoreContext';

import translations from './translations.json';
import './artefact-overview.scss';

export type ArtefactOverviewItem = {
  id: string;
  entityType: string;
  objectName: string;
  title: string;
  repository: string;
  owner: string;
  inventor: string;
  artist: string;
  date: string;
  dimensions: string;
  classification: string;
  printProcess: string;
  imgSrc: string;
  to: string;
  openInNewWindow: boolean;
  medium: string;
  searchSortingNumber: string,
  _highlight?: Record<string, Array<string>>;
};

export enum ArtefactOverviewType {
  CARD = 'card',
  CARD_SMALL = 'card-small',
  LIST = 'list',
  TABLE = 'table',
}

type OverviewProps = {
  items?: ArtefactOverviewItem[],
  viewType?: ArtefactOverviewType,
  handleArtefactNumberChange?: (amount: number) => void;
  resetArtefactNumber?: () => void;
}

const DefaultViewType = ArtefactOverviewType.CARD;
const maximumTitleLengthInWords = 10;

const Overview: FC<OverviewProps> = ({
  items = [],
  viewType = DefaultViewType,
  handleArtefactNumberChange = () => {},
  resetArtefactNumber = () => {},
}) => {
  const { root: { collection, ui } } = useContext(StoreContext);

  const { t } = ui.useTranslation('ArtefactOverview', translations);

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

  const cleanupRecord = (record: string): string => {
    const recordElements = record.split(/,/);
    const cleanRecord = recordElements[0].replace(/(\(.*?\)|\[.*?\])/,"");
    return cleanRecord;
  }

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
      case EntityType.ARCHIVALS:
        return '';
      case EntityType.GRAPHICS:
        return `${item.classification}, ${item.printProcess}`;
    }
    return cleanupRecord(item.medium);
  }

  const assembleSubTitleForListView = (item: ArtefactOverviewItem): string => {
    switch (item.entityType) {
      case EntityType.ARCHIVALS:
        return '';
      case EntityType.GRAPHICS:
        return `${item.classification}, ${item.printProcess}`;
    }

    return item.medium;
  }

  const assembleTextForCardView = (item: ArtefactOverviewItem): string => {
    switch (item.entityType) {
      case EntityType.ARCHIVALS:
        return '';
      case EntityType.GRAPHICS:
        return `${item.inventor}`;
    }
    return `${item.repository}`;
  }

  const assembleTextForListView = (item: ArtefactOverviewItem): string => {
    return `${item.artist}`;
  }

  const assembleAdditionalText = (item: ArtefactOverviewItem): Array<string> => {
    const dimensions = item.dimensions ? item.dimensions : '';
    const dimensionList = dimensions.split(/\n/);
    const owner = item.repository ? item.repository : '';
    return [dimensionList[0], owner];
  }

  const getSuitableAmountOfArtefacts = (elRef: HTMLElement) => {
    const styles = getComputedStyle(document.documentElement);
    const tileSize = parseFloat(styles.getPropertyValue('--tile-fix'));

    const artefactOverviewDimensions = {
      'width': elRef.clientWidth + 1,
      'height': elRef.clientHeight
    };

    const rows = Math.floor(artefactOverviewDimensions.height / tileSize);
    const cols = Math.floor(artefactOverviewDimensions.width / tileSize);

    return cols * rows;
  }

  const setFittedArtefactAmount = () => {
    const element = artefactOverviewElRef.current;
    if (!element) return;
    const suitableAmountOfArtefacts = getSuitableAmountOfArtefacts(element);
    handleArtefactNumberChange(suitableAmountOfArtefacts);
  }

  const isFavorite = (id: string): boolean => {
    return !!collection.collectionIncludesArtefact(id);
  };

  const toggleFavorite = (id: string): void => {
    if (isFavorite(id)) {
      collection.removeArtefactFromCollection(id);
    } else {
      collection.addArtefactToCollection(id);
    }
  };

  const tableData = ((artifactKind: UIArtifactKind, items: ArtefactOverviewItem[]): Pick<ArtefactTableProps, 'head' | 'items'> => {
    if (items.length === 0) {
      return {
        head: [],
        items: [],
      };
    }

    if ([UIArtifactKind.WORKS, UIArtifactKind.PAINTINGS].includes(artifactKind)) {
      return {
        head: [
          { fieldName: 'title', text: t('Title') },
          { fieldName: 'artist', text: t('Artist'), options: { noWrap: true } },
          { fieldName: 'medium', text: t('Medium') },
          { fieldName: 'repository', text: t('Repository') },
          { fieldName: 'date', text: t('Date'), options: { noWrap: true } },
        ],
        items: items.map((item) => ({
          id: item.id,
          to: item.to,
          imgSrc: item.imgSrc,
          imgAlt: '',
          date: item.date,
          title: item.title,
          medium: item.medium,
          artist: item.artist,
          repository: item.repository,
          isFavorite: isFavorite(item.id),
        })),
      };
    }

    return {
      head: [
        { fieldName: 'date', text: t('Date'), options: { noWrap: true } },
        { fieldName: 'summary', text: t('Summary'), options: { forceColumnTextWrap: true } },
      ],
      items: items.map((item) => ({
        id: item.id,
        to: item.to,
        imgSrc: item.imgSrc,
        imgAlt: '',
        date: item.date,
        summary: item.title,
        isFavorite: isFavorite(item.id),
      })),
    };
  })(ui.artifactKind, items);

  useEffect(() => {
    if (!artefactOverviewElRef.current) return;

    if (viewType === ArtefactOverviewType.CARD_SMALL) {
      setFittedArtefactAmount();
      window.addEventListener('resize', setFittedArtefactAmount);

      return () => window.removeEventListener('resize', setFittedArtefactAmount);
    } else {
      resetArtefactNumber();
    }
  }, [viewType, artefactOverviewElRef]);

  return (<div
    ref={ artefactOverviewElRef }
    className={`artefact-overview ${ ArtefactOverviewType.TABLE === viewType ? 'artefact-overview--is-table' : 'artefact-overview--is-grid' }`}
    data-component="structure/visualizing/artefact-overview"
    data-active-view={viewType}
  >
    {
      ArtefactOverviewType.TABLE === viewType && <ArtefactTable
        head={ tableData.head }
        items={ tableData.items }
        onFavoriteToggle={toggleFavorite}
      ></ArtefactTable>
    }

    {
      ArtefactOverviewType.TABLE !== viewType && items.map(item => (<div
        key={item.id}
        className="overview-item"
        data-sorting-number={item.searchSortingNumber}
      >
        {ArtefactOverviewType.CARD === viewType && <ArtefactCard
          id={item.id}
          title={assembleTitleForCardView(item)}
          subtitle={assembleSubTitleForCardView(item)}
          text={assembleTextForCardView(item)}
          to={item.to}
          imgSrc={item.imgSrc || ''}
          openInNewWindow={item.openInNewWindow}

          isFavorite={isFavorite(item.id)}
          onFavoriteToggle={() => toggleFavorite(item.id)}
        />
        }

        {ArtefactOverviewType.CARD_SMALL === viewType && <ArtefactCard
          id={item.id}
          to={item.to}
          imgSrc={item.imgSrc || ''}

          isFavorite={isFavorite(item.id)}
          onFavoriteToggle={() => toggleFavorite(item.id)}
        />
        }

        {ArtefactOverviewType.LIST === viewType && <ArtefactLine
          id={item.id}
          title={assembleTitleForListView(item)}
          subtitle={assembleSubTitleForListView(item)}
          text={assembleTextForListView(item)}
          additionalText={assembleAdditionalText(item)}

          to={item.to}
          imgSrc={item.imgSrc || ''}

          isFavorite={isFavorite(item.id)}
          onFavoriteToggle={() => toggleFavorite(item.id)}
        />
        }
      </div>
      ))
    }
  </div>
  );
};

type SwitcherProps = {
  viewType?: ArtefactOverviewType,
  handleChange?: (view: ArtefactOverviewType) => void,
  className?: string,
}

const OverviewSwitcher: FC<SwitcherProps> = ({
  viewType = DefaultViewType,
  handleChange = () => { },
  className = '',
}) => {

  const allViewEntries = [
    {
      type: ArtefactOverviewType.CARD,
      icon: 'view_module',
    },
    {
      type: ArtefactOverviewType.CARD_SMALL,
      icon: 'view_comfy',
    },
    {
      type: ArtefactOverviewType.LIST,
      icon: 'view_list',
    },
    {
      type: ArtefactOverviewType.TABLE,
      icon: 'view_headline',
    },
  ];

  return (<Switcher className={`artefact-overview-switcher ${className}`} >
    {allViewEntries.map(({ type, icon }) => (
      <Switcher.Item
        key={type}
      >
        <i
          className={`icon artefact-overview-switcher-item-icon ${(type === viewType) ? 'is-active' : ''}`}
          data-icon={icon}
          onClick={() => handleChange(type)}
        ></i>
      </Switcher.Item>
    ))}
  </Switcher>);
};

const ArtefactOverview = {
  Overview: observer(Overview),
  Switcher: observer(OverviewSwitcher),
}

export default ArtefactOverview;
