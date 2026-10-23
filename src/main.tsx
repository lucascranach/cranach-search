import React, { FC, useState } from 'react'
import ReactDOM from 'react-dom'
import StoreProvider from './providers/StoreProvider';
import './style/main.scss'
import App from './App'
import MaintenanceNotice from './components/pages/maintenance-notice';
import {
  MAINTENANCE_MODE,
  isMaintenanceNoticeDismissed,
  dismissMaintenanceNotice,
} from './maintenance';

/*
  In maintenance mode the notice is shown first. The store (and with it every
  API request) is only created once the notice has been dismissed.
*/
const Root: FC = () => {
  const [showNotice, setShowNotice] = useState(
    () => MAINTENANCE_MODE && !isMaintenanceNoticeDismissed(),
  );

  if (showNotice) {
    return (
      <MaintenanceNotice
        onDismiss={() => {
          dismissMaintenanceNotice();
          setShowNotice(false);
        }}
      />
    );
  }

  return (
    <StoreProvider>
      <App />
    </StoreProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById('root')
)
