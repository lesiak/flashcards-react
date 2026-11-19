import React from 'react'
import ReactDOM from 'react-dom/client'
import {FluentProvider} from '@fluentui/react-components';
import App from './App.tsx'
import {LanguageContextProvider} from "./context/LanguageContext.tsx";
import {appTheme} from './model/AppTheme.ts';

// The page colour and the hover glow in App.css come from the theme too.
const root = document.documentElement.style;
root.setProperty('--app-page', appTheme.page);
root.setProperty('--app-accent', appTheme.accent);
root.setProperty('--app-glow', `${appTheme.glow}%`);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <FluentProvider theme={appTheme.fluent} style={{backgroundColor: appTheme.page}}>
      <LanguageContextProvider>
        <App/>
      </LanguageContextProvider>
    </FluentProvider>
  </React.StrictMode>,
)
