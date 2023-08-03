import React from 'react'
import ReactDOM from 'react-dom/client'
import {FluentProvider, teamsLightTheme} from '@fluentui/react-components';
import App from './App.tsx'
import {LanguageContextProvider} from "./context/LanguageContext.tsx";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <FluentProvider theme={teamsLightTheme}>
      <LanguageContextProvider>
        <App/>
      </LanguageContextProvider>
    </FluentProvider>
  </React.StrictMode>,
)
