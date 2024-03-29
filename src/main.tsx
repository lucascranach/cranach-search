import React from 'react'
import ReactDOM from 'react-dom'
import StoreProvider from './providers/StoreProvider';
import './style/main.scss'
import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
