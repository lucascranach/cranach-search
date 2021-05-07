
import React from 'react';
import { render } from '@testing-library/react';

import Link from '.';

describe('Atoms/Link', () => {
  /* Element selectors */
  const linkSelector = '[data-component="atoms/link"]';

  it('renders correctly', () => {
    const { container } = render(
      <Link/>,
    );

    expect(!!container.querySelector(linkSelector)).toBe(true);
  });

  it('references internal links correctly', () => {
    const internalUrl = '/example-internal-url';

    const { container } = render(
      <Link
        to={ internalUrl }
      />,
    );

    const elNode = container.querySelector(linkSelector);

    expect(elNode.getAttribute('href')).toEqual(internalUrl);
  });

  it('references external links correctly', () => {
    const externalUrl = 'https://www.th-koeln.de/';

    const { container } = render(
      <Link
        to={ externalUrl }
      />,
    );

    const elNode = container.querySelector(linkSelector);

    expect(elNode.getAttribute('href')).toEqual(externalUrl);
  });
});
