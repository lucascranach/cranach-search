import React from 'react';
import { storiesOf } from '@storybook/react';

import '~/styles/main.scss';

import Link from '.';


storiesOf('Components|Atoms/Link', module)
  .add('with internal location', () => (
    <Link
      to='/'
    >Internal Link</Link>
  ))
  .add('with external location', () => (
    <Link
      to='http://www.th-koeln.de/'
    >External Link</Link>
  ))
  .add('with an active class name', () => (
    <Link
      to='/'
      activeClassName='is-active'
    >Link with active class</Link>
  ))
  .add('with children', () => (
    <Link
      to=''
      activeClassName=''
    >
      <div style={{ width: '100px', height: '100px', backgroundColor: 'blue' }}></div>
      <button>A button</button>
    </Link>
  ));
