import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { MessageProvider } from './contexts/Message/MessageProvider.jsx'
import { ThemeProvider } from './contexts/Theme/ThemeProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <MessageProvider>
          <App />
        </MessageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
