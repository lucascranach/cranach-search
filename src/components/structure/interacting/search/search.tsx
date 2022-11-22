import React, { FC, useContext, Fragment} from 'react';
import { observer } from 'mobx-react-lite';

import SearchWorks from '../search-works';
import SearchArchivals from '../search-archivals';

import StoreContext, {
  UIArtifactKind,
} from '../../../../store/StoreContext';

const Search: FC = () => {
  const { root: { ui } } = useContext(StoreContext);

  const worksArtifactKinds = new Set([UIArtifactKind.WORKS, UIArtifactKind.PAINTINGS]);
  const archivalsArtifactKinds = new Set([UIArtifactKind.ARCHIVALS]);

  return (
    <Fragment>
      { worksArtifactKinds.has(ui.artifactKind) && <SearchWorks /> }
      { archivalsArtifactKinds.has(ui.artifactKind) && <SearchArchivals /> }
    </Fragment>
  );
};

export default observer(Search);
