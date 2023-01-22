import React, { FC, useContext, useEffect, useRef } from 'react';

import { observer } from 'mobx-react-lite';

import ArtefactOverview, { ArtefactOverviewType } from '../../structure/visualizing/artefact-overview';
import ArtefactCard, { Props as ArtifactCardProps } from '../../structure/visualizing/artefact-card';
import ArtefactLine, { Props as ArtifactLineProps } from '../../structure/visualizing/artefact-line';
import ArtefactTable, { Props as ArtifactTableProps } from '../../structure/visualizing/artefact-table';
import Cloak from '../../base/visualizing/cloak';
import SearchResultNavigation from '../../structure/interacting/search-result-navigation';
import Navigation from '../../structure/interacting/navigation';
import ScrollTo from '../../base/interacting/scroll-to';
import StoreContext, { UIOverviewViewType, EntityType, UIArtifactKind } from '../../../store/StoreContext';

import translations from './translations.json';
import './dashboard.scss';
import { ArtifactKind, GlobalSearchArtifact } from '../../../api/types';

const Dashboard: FC = () => {
  const { root: { lighttable, ui, collection } } = useContext(StoreContext);

  const { t } = ui.useTranslation('Dashboard', translations);

  const mainContentEl = useRef<HTMLElement|null>(null);

  const maximumTitleLengthInWords = 10;

  useEffect(() => {
    lighttable.fetch();
  }, [])

  useEffect(() => {
    if (window.scrollY < window.innerHeight) return;
    window.scrollTo({ behavior: 'smooth', top: 0 });
  }, [lighttable.flattenedResultItem]);

  useEffect(() => {
    if (!mainContentEl.current || mainContentEl.current.scrollTop === 0) return;
    mainContentEl.current.scrollTo({ behavior: 'smooth', top: 0 });
  }, [mainContentEl, lighttable.flattenedResultItem]);

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

  const getToUrlForArtifact = (_: EntityType, id: string): string => {
    const cdaArtefactUrlPattern = import.meta.env.VITE_CDA_ARTEFACT_URL as string;
    return cdaArtefactUrlPattern.replace('{{lang}}', ui.lang).replace('{{id}}', id);
  };

  const mapSelectedOverviewViewType = (type: UIOverviewViewType): ArtefactOverviewType => ({
    [UIOverviewViewType.CARD]: ArtefactOverviewType.CARD,
    [UIOverviewViewType.CARD_SMALL]: ArtefactOverviewType.CARD_SMALL,
    [UIOverviewViewType.LIST]: ArtefactOverviewType.LIST,
    [UIOverviewViewType.TABLE]: ArtefactOverviewType.TABLE,
  })[type];

  const hasHighlightedText = (item: GlobalSearchArtifact, prop: keyof GlobalSearchArtifact): boolean => {
    return !!(item._highlight && item._highlight[prop])
  }

  const getAvailableHighlightExcerpt = (item: GlobalSearchArtifact, prop: keyof GlobalSearchArtifact) => {
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

  const getImgSrcOrFallback = (item: GlobalSearchArtifact): string => {
    return 'imgSrc' in item && item.imgSrc ? item.imgSrc : (import.meta.env.BASE_URL + 'assets/no-image--trans.png');
  }

  const shortenTitle = (title: string): string => {
    const splitTitle = title.split(' ');
    return splitTitle.length <= maximumTitleLengthInWords ? title : `${splitTitle.slice(0, maximumTitleLengthInWords).join(' ')} …`;
  };

  const assembleTitleForCardView = (item: GlobalSearchArtifact): string => {
    const title = hasHighlightedText(item, 'title')
      ? getAvailableHighlightExcerpt(item, 'title') as string
      : shortenTitle(item.title);

    return `${title}, ${item.date}`;
  }

  const assembleTitleForListView = (item: GlobalSearchArtifact): string => {
    const title = hasHighlightedText(item, 'title')
      ? getAvailableHighlightExcerpt(item, 'title') as string
      : shortenTitle(item.title);

    return `${title}, ${item.date}`;
  }

  const assembleSubTitleForCardView = (item: GlobalSearchArtifact): string => {
    switch (item.kind) {
      case ArtifactKind.ARCHIVAL:
      case ArtifactKind.LITERATURE_REFERENCE:
        return '';
      case ArtifactKind.WORK:
        return `${item.classification}, ${item.printProcess}`;
    }
  }

  const assembleSubTitleForListView = (item: GlobalSearchArtifact): string => {
    switch (item.kind) {
      case ArtifactKind.ARCHIVAL:
      case ArtifactKind.LITERATURE_REFERENCE:
        return '';
      case ArtifactKind.WORK:
        return (item.entityType === EntityType.GRAPHIC)
          ? `${item.classification}, ${item.printProcess}`
          : item.medium;
    }
  }

  const assembleTextForCardView = (item: GlobalSearchArtifact): string => {
    switch (item.kind) {
      case ArtifactKind.ARCHIVAL:
      case ArtifactKind.LITERATURE_REFERENCE:
        return '';

      case ArtifactKind.WORK:
        return item.entityType === EntityType.GRAPHIC
        ? `${item.inventor}`
        : `${item.repository}`;
    }
  }

  const assembleTextForListView = (item: GlobalSearchArtifact): string => {
    return item.kind === ArtifactKind.WORK
      ? `${item.artist}`
      : '';
  }

  const assembleAdditionalText = (item: GlobalSearchArtifact): Array<string> => {
    if (item.kind === ArtifactKind.WORK) {
      const dimensions = item.dimensions ? item.dimensions : '';
      const dimensionList = dimensions.split(/\n/);
      const owner = item.repository ? item.repository : '';
      return [dimensionList[0], owner];
    }

    return [];
  }

  const viewType = mapSelectedOverviewViewType(ui.overviewViewType);

  const tablePropsMapper = (items: GlobalSearchArtifact[], artifactKind: UIArtifactKind): Pick<ArtifactTableProps, 'head' | 'items' | 'options'> => {
    if (items.length === 0) {
      return {
        head: [],
        items: [],
      };
    }

    if (artifactKind & UIArtifactKind.WORKS) {
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
          to: getToUrlForArtifact(item.entityType, item.id),
          imgSrc: getImgSrcOrFallback(item),
          imgAlt: '',
          date: item.date,
          title: item.title,
          medium: item.kind === ArtifactKind.WORK ? item.medium : '',
          artist: item.kind === ArtifactKind.WORK ? item.artist : '',
          repository: item.kind === ArtifactKind.WORK ? item.repository : '',
          isFavorite: isFavorite(item.id),
        })),
      };
    }

    if (artifactKind === UIArtifactKind.LITERATURE_REFERENCES) {
      return {
        options: {
          showImageColumn: false,
          enableFavorite: false,
        },
        head: [
          { fieldName: 'referenceNumber', text: t('Signature'), options: {
            sort: lighttable.getSortingForFieldname('referenceNumber'),
            noWrap: true,
            noWrapHead: true,
          }},
          { fieldName: 'authors', text: t('Author/Editor'), options: {
            sort: lighttable.getSortingForFieldname('authors'),
            noWrapHead: true,
          }},

          { fieldName: 'publishLocation', text: t('Place of Publication'), options: {
            sort: lighttable.getSortingForFieldname('publishLocation'),
            noWrapHead: true,
          }},
          { fieldName: 'publishDate', text: t('Year'), options: {
            sort: lighttable.getSortingForFieldname('publishDate'),
            noWrapHead: true,
          }},
          { fieldName: 'textCategory', text: t('Text Category'), options: {
            sort: lighttable.getSortingForFieldname('textCategory'),
            noWrap: true,
            noWrapHead: true,
          }},
          { fieldName: 'title', text: t('Title'), options: {
            sort: lighttable.getSortingForFieldname('title'),
            asInnerHTML: true,
            noWrapHead: true,
          }},
        ],
        items: items.map((item) => ({
          id: item.id,
          to: getToUrlForArtifact(item.entityType, item.id),
          imgSrc: getImgSrcOrFallback(item),
          imgAlt: '',
          referenceNumber: item.kind === ArtifactKind.LITERATURE_REFERENCE ? item.referenceNumber : '',
          authors: item.kind === ArtifactKind.LITERATURE_REFERENCE ? item.authors : '',
          publishLocation : item.kind === ArtifactKind.LITERATURE_REFERENCE ? item.publishLocation : '',
          publishDate: item.kind === ArtifactKind.LITERATURE_REFERENCE ? item.publishDate : '',

          textCategory: item.kind === ArtifactKind.LITERATURE_REFERENCE ? item.textCategory : '',

          title: item.title,

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
        to: getToUrlForArtifact(item.entityType, item.id),
        imgSrc: getImgSrcOrFallback(item),
        imgAlt: '',
        date: item.date,
        summary: item.title,
        isFavorite: isFavorite(item.id),
      })),
    };
  };

  const cardPropsMapper = (item: GlobalSearchArtifact, viewType: ArtefactOverviewType): ArtifactCardProps => {
    if (viewType === ArtefactOverviewType.CARD) {
      return {
        id: item.id,
        title: assembleTitleForCardView(item),
        subtitle: assembleSubTitleForCardView(item),
        text: assembleTextForCardView(item),
        to: getToUrlForArtifact(item.entityType, item.id),
        imgSrc: getImgSrcOrFallback(item),
        openInNewWindow: false,
      };
    } else {
      return {
        id: item.id,
        to: getToUrlForArtifact(item.entityType, item.id),
        imgSrc: getImgSrcOrFallback(item),
        openInNewWindow: false,
      };
    }
  };

    const listPropsMapper = (item: GlobalSearchArtifact): ArtifactLineProps => {
    return {
      id: item.id,
      title: assembleTitleForListView(item),
      subtitle: assembleSubTitleForListView(item),
      text: assembleTextForListView(item),
      additionalText: assembleAdditionalText(item),

      to: getToUrlForArtifact(item.entityType, item.id),
      imgSrc: getImgSrcOrFallback(item),
    };
  };

  const getNextSortDirection = (sortDirection: 'asc' | 'desc' | null): 'asc' | 'desc' | null => {
    if (!sortDirection) {
      return 'asc';
    } else if (sortDirection === 'asc') {
      return 'desc';
    } else {
      return null;
    }
  };

  const updateSortingForFieldname = (fieldName: string, direction: 'asc' | 'desc' | null): void => {
    lighttable.setSortingForFieldname(fieldName, getNextSortDirection(direction));
  };

  return (
    <div
      className="dashboard"
      data-component="page/search"
    >
      <Navigation></Navigation>
      <main
        className={`main-content ${ lighttable.loading ? 'main-content--non-scrollable' : '' }`}
        ref={mainContentEl}
      >
        <ArtefactOverview.Overview
          viewType={mapSelectedOverviewViewType(ui.overviewViewType)}
          handleArtefactAmountChange={ (amount: number) => lighttable.setSize(amount) }
        >
          {

            ArtefactOverviewType.TABLE === viewType && (<ArtefactTable
              { ...tablePropsMapper(lighttable.flattenedResultItem, ui.artifactKind) }
              onFavoriteToggle={toggleFavorite}
              onSortChange={updateSortingForFieldname}
            ></ArtefactTable>)

            ||

            ArtefactOverviewType.TABLE !== viewType && lighttable.flattenedResultItem.map((artifactItem) => (<div
              key={artifactItem.id}
              className="overview-item"
              data-sorting-number={artifactItem.searchSortingNumber}
            >
              {
                [ArtefactOverviewType.CARD, ArtefactOverviewType.CARD_SMALL].includes(viewType) && <ArtefactCard
                  { ...cardPropsMapper(artifactItem, viewType) }
                  isFavorite={isFavorite(artifactItem.id)}
                  onFavoriteToggle={() => toggleFavorite(artifactItem.id)}
                />
              }

              {
                ArtefactOverviewType.LIST === viewType && <ArtefactLine
                  { ...listPropsMapper(artifactItem) }
                  isFavorite={isFavorite(artifactItem.id)}
                  onFavoriteToggle={() => toggleFavorite(artifactItem.id)}
                />
              }
            </div>
            ))

          }
        </ArtefactOverview.Overview>
        { lighttable.loading && <Cloak /> }
      </main>
      <SearchResultNavigation></SearchResultNavigation>
      <ScrollTo className="scroll-up" hideIf={ !ui.leftInitialViewArea }></ScrollTo>
    </div>
  );
};

export default observer(Dashboard);
