import React, { FC, useRef, useEffect } from 'react';
import Switcher from '../../../base/interacting/switcher';

import './artefact-overview.scss';

export enum ArtefactOverviewType {
  CARD = 'card',
  CARD_SMALL = 'card-small',
  LIST = 'list',
  TABLE = 'table',
}

type OverviewProps = {
  viewType: ArtefactOverviewType,
  handleArtefactAmountChange?: (amount: number) => void;
}

const DefaultViewType = ArtefactOverviewType.CARD;

const Overview: FC<OverviewProps> = ({
  viewType = DefaultViewType,
  handleArtefactAmountChange = () => {},
  children,
}) => {
  const artefactOverviewElRef = useRef<HTMLDivElement | null>(null);

  const getSuitableAmountOfArtefacts = (elRef: HTMLElement) => {
    const styles = getComputedStyle(document.documentElement);
    const tileSize = parseFloat(styles.getPropertyValue('--tile-fix'));

    const artefactOverviewDimensions = {
      'width': elRef.clientWidth,
      'height': elRef.clientHeight
    };

    const safetyDistance = 1;
    const rows = Math.floor(artefactOverviewDimensions.height / tileSize) - safetyDistance;
    const cols = Math.floor(artefactOverviewDimensions.width / tileSize);

    return cols * rows;
  }

  const setFittedArtefactAmount = () => {
    const element = artefactOverviewElRef.current;
    if (!element) return;
    const suitableAmountOfArtefacts = getSuitableAmountOfArtefacts(element);
    handleArtefactAmountChange(suitableAmountOfArtefacts);
  }

  useEffect(() => {
    if (!artefactOverviewElRef.current) return;

    if (viewType === ArtefactOverviewType.CARD_SMALL) {
      setFittedArtefactAmount();
      window.addEventListener('resize', setFittedArtefactAmount);

      return () => window.removeEventListener('resize', setFittedArtefactAmount);
    }
  }, [viewType, artefactOverviewElRef]);

  return (<div
    ref={ artefactOverviewElRef }
    className={`artefact-overview ${ ArtefactOverviewType.TABLE === viewType ? 'artefact-overview--is-table' : 'artefact-overview--is-grid' }`}
    data-component="structure/visualizing/artefact-overview"
    data-active-view={viewType}
  >
    { children }
  </div>
  );
};

type SwitcherProps = {
  viewType?: ArtefactOverviewType,
  handleChange?: (view: ArtefactOverviewType) => void,
  className?: string,
  limitedToViews?: ArtefactOverviewType[],
}

const OverviewSwitcher: FC<SwitcherProps> = ({
  viewType = DefaultViewType,
  handleChange = () => { },
  className = '',
  limitedToViews = [],
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

  const inLimitMode = limitedToViews.length > 0;

  return (<Switcher className={`artefact-overview-switcher ${className}`} >
    {allViewEntries.map(({ type, icon }) => {
      const isSelected = type === viewType;
      const notLimited = inLimitMode && !limitedToViews.includes(type);
      const isDisabled = isSelected || notLimited;

      return (<Switcher.Item
        key={type}
      >
        <i
          className={`icon artefact-overview-switcher-item-icon ${isDisabled ? 'is-disabled' : ''}`}
          data-icon={icon}
          onClick={() => { if (!isDisabled) handleChange(type) }}
        ></i>
      </Switcher.Item>);
    })
  }
  </Switcher>);
};

const ArtefactOverview = {
  Overview,
  Switcher: OverviewSwitcher,
}

export default ArtefactOverview;
