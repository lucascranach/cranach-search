import React, { FC, Dispatch, SetStateAction, useState } from 'react';

import Toggle from "../../../base/interacting/toggle";

import './accordion.scss';

type Prop = {
  className?: string,
};

type EntryProp = {
  title: string,
  toggle?: [boolean, Dispatch<SetStateAction<boolean>>],
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
  toggle = undefined,
  isOpen = false,
}) => {
  if (!toggle) {
    toggle = useState(isOpen)
  }

  return (<Toggle
      className="accordion-entry"
      title={title}
      isOpen={toggle[0]}
      onToggle={() => toggle && toggle[1](!toggle[0])}
    >
      { children }
    </Toggle>
  );
}

export default Accordion;
