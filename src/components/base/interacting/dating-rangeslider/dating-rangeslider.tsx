import React, { FC, useRef, useEffect, useContext, useState } from 'react';
import nouislider, { API, PipsMode } from 'nouislider';

import TextInput from '../text-input';

import translations from './translations.json';
import './dating-rangeslider.scss';

import StoreContext from '../../../../store/StoreContext';

type Props = {
  className?: string;
  bounds: [number, number];
  start: number;
  end: number;
  onChange?: (currentStart: number, currentEnd: number) => void;
}

const DatingRangeslider: FC<Props> = ({
  className = '',
  bounds,
  start,
  end,
  onChange = () => {},
}) => {
  const { root: { ui } } = useContext(StoreContext);
  const { t } = ui.useTranslation('Dating-Rangeslider', translations);
  const elRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<API | null>(null);
  const [from, setFrom] = useState(start.toString());
  const [till, setTill] = useState(end.toString());

  useEffect(() => {
    if (!elRef.current) return;

    sliderRef.current = nouislider.create(elRef.current, {
      connect: true,
      step: 1,
      start: [start, end],
       handleAttributes: [
        { 'aria-label': 'start' },
        { 'aria-label': 'end' },
      ],
      range: {
        'min': [bounds[0]],
        '90%': [bounds[1], 1],
        'max': [bounds[1] + 1],
      },
      pips: {
        mode: PipsMode.Steps,
        filter: (value, type) => {
          switch (type) {
            case 1:
              return (value !== bounds[1] + 1) ? 1 : 0;

            case 2:
              if (!((value - bounds[0]) % 50)) return 1;

              return !(value % 5) ? 0 : -1;
            default:
              return -1;
          }
        },
        density: 1,
      }
    });

    sliderRef.current.on('set', (values) => {
      const currentStart = parseInt(values[0].toString(), 10);
      const currentEnd = parseInt(values[1].toString(), 10);

      onChange(currentStart, currentEnd);
    });

    sliderRef.current.on('update', (values) => {
      const currentFrom = parseInt(values[0].toString(), 10);
      const currentTill = parseInt(values[1].toString(), 10);

      setFrom(currentFrom.toString());
      setTill(currentTill > bounds[1] ? '' : currentTill.toString());
    });

    return () => {
      if (sliderRef.current) {
        sliderRef.current.off('set');
        sliderRef.current.off('update');
        sliderRef.current.destroy();
      }
    };
  }, [elRef, bounds]);

  return (<div
      className={ `dating-rangeslider ${className}` }
      data-component="base/interacting/dating-rangeslider"
    >
      <div
        ref={ elRef }
        className="dating-rangeslider__rangeslider"
      ></div>
      <div className="dating-rangeslider__input-holder">
        <TextInput
          className="dating-rangeslider__year-input"
          value={ from }
          label={ t('from') }
          onChange={ () => {} }
          disabled={ true }
        />
        <TextInput
          className="dating-rangeslider__year-input"
          value={ till }
          label={ t('till') }
          onChange={ () => {} }
          disabled={ true }
        />
      </div>
    </div>);
};

export default DatingRangeslider;
