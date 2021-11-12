import React from 'react'
import ReactDOM from 'react-dom'
import { Router } from 'react-router-dom'
import StoreProvider from './providers/StoreProvider';
import { createBrowserHistory } from 'history';
import './style/main.scss'
import App from './App'

// https://github.com/superwf/mobx-react-router
const history = createBrowserHistory();

ReactDOM.render(
  <React.StrictMode>
    <StoreProvider history={history}>
      <Router history={history}>
        <App />
      </Router>
    </StoreProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
