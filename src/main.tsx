import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {LanguageContextProvider} from "./context/LanguageContext.tsx";
import {ThemeContextProvider} from './context/ThemeContext.tsx';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <LanguageContextProvider>
        <App/>
      </LanguageContextProvider>
    </ThemeContextProvider>
  </React.StrictMode>,
)
