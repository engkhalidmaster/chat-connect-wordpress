
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from '@/components/ui/toaster'

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Root element not found')
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
      <Toaster />
    </StrictMode>
  )
}
