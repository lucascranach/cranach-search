import React, { FC } from 'react';

import Switcher from '../../../base/interacting/switcher';
import ArtefactCard from '../artefact-card';
import ArtefactLine from '../artefact-line';

import './artefact-overview.scss';

/* TODO: introduce an item type only for the artefact overview */
import { GlobalSearchArtifact } from '../../../../api/globalSearch';

type View = {
  type: string,
  icon: string,
};

type OverviewProps = {
  items?: GlobalSearchArtifact[],
  view?: View,
}

type SwitcherProps = {
  view?: View,
  handleChange?: (view: View) => void,
}

const CardView: View = {
  type: 'card',
  icon: 'view_column',
};

const CardSmallView: View = {
  type: 'card-small',
  icon: 'view_module',
};

const ListView: View = {
  type: 'list',
  icon: 'view_list',
};

const SupportedViews = [
  CardView,
  CardSmallView,
  ListView,
];

const DefaultView = CardView;

const ArtefactOverview: FC<OverviewProps> & { Switcher: FC<SwitcherProps>, DefaultView: View } = ({
  items = [],
  view = DefaultView,
}) => (
    <div

    className="artefact-overview"
    data-component="structure/visualizing/artefact-overview"
    data-active-view={ view.type }
  >
    {
        items.map(item => (<div
          key={ item.inventoryNumber }
          className="overview-item"
        >
        { CardView === view && <ArtefactCard
            title={ item.title } /* TODO: use short-title */
            subtitle={ item.subtitle }
            date={ item.date }
            to={item.to}
            classification={item.classification}
            imgSrc={ item.imgSrc || '' }
          />
        }

          { CardSmallView === view && <ArtefactCard
            to={ item.to }
            imgSrc={ item.imgSrc || '' }
          />
          }

        { ListView === view && <ArtefactLine
            title={ item.title }
            subtitle={ item.subtitle }
            date={ item.date }
            additionalInfoList={ item.additionalInfoList }
            to={ item.to }
            imgSrc={ item.imgSrc || '' }
          />
        }
        </div>
        ))
    }
  </div>
);

ArtefactOverview.Switcher = ({
  view = DefaultView,
  handleChange = () => {},
}) => (
  <Switcher className="artefact-overview-switcher" >
    { SupportedViews.map(currentView => (
      <Switcher.Item
        key={ currentView.type }
      >
        <i
          className={ `material-icons artefact-overview-switcher-item-icon ${(currentView === view) ? 'is-active' : ''}` }
          onClick={ () => handleChange(currentView) }
        >{ currentView.icon }</i>
      </Switcher.Item>
    )) }
  </Switcher>
);

ArtefactOverview.DefaultView = DefaultView;

export default ArtefactOverview;
