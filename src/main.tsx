import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { HashRouter } from 'react-router-dom'
import App from './App/app'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})
