import React, { FC, useContext, Fragment} from 'react';
import { observer } from 'mobx-react-lite';

import SearchWorks from '../search-works';
import SearchArchivals from '../search-archivals';
import SearchLiteratureReferences from '../search-literature-references';

import StoreContext, {
  UIArtifactKind,
} from '../../../../store/StoreContext';

const Search: FC = () => {
  const { root: { ui } } = useContext(StoreContext);

  const worksArtifactKinds = new Set([UIArtifactKind.WORKS, UIArtifactKind.PAINTINGS, UIArtifactKind.DRAWINGS, UIArtifactKind.PRINTS]);
  const archivalsArtifactKinds = new Set([UIArtifactKind.ARCHIVALS]);
  const literatureReferencesArtifactKinds = new Set([UIArtifactKind.LITERATURE_REFERENCES]);

  return (
    <Fragment>
      { worksArtifactKinds.has(ui.artifactKind) && <SearchWorks /> }
      { archivalsArtifactKinds.has(ui.artifactKind) && <SearchArchivals /> }
      { literatureReferencesArtifactKinds.has(ui.artifactKind) && <SearchLiteratureReferences /> }
    </Fragment>
  );
};

export default observer(Search);
