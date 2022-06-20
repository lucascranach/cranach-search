import React, { FC } from 'react';

import Toggle from "../../../base/interacting/toggle";

import './accordion.scss';

type Prop = {
  className?: string,
};

type EntryProp = {
  title: string,
  onToggle?: (toggleTo: boolean) => void,
  isOpen?: boolean
}

const Accordion: FC<Prop> & { Entry: FC<EntryProp> } = ({ children, className = '' }) => (
  <div
    className={ `accordion ${className}` }
    data-component="structure/interacting/accordion"
  >
    { children }
  </div>
);

Accordion.Entry = ({
  title,
  children,
  onToggle = undefined,
  isOpen = false,
}) => {
  return (<Toggle
      className="accordion-entry"
      title={title}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      { children }
    </Toggle>
  );
}

export default Accordion;
