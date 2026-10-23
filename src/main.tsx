import React from 'react'
import ReactDOM from 'react-dom'
import StoreProvider from './providers/StoreProvider';
import './style/main.scss'
import App from './App'
import MaintenanceNotice from './components/pages/maintenance-notice';
import { MAINTENANCE_MODE } from './maintenance';

/* In maintenance mode the store is never created, so no API requests are sent */
ReactDOM.render(
  <React.StrictMode>
    {MAINTENANCE_MODE
      ? <MaintenanceNotice />
      : (
        <StoreProvider>
          <App />
        </StoreProvider>
      )
    }
  </React.StrictMode>,
  document.getElementById('root')
)
