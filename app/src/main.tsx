import './utils/logging' // Must be first to capture all console output
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import AuthInitializer from '@components/AuthInitializer'
import { ThemeProvider } from '@contexts/ThemeContext'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthInitializer />
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
) 