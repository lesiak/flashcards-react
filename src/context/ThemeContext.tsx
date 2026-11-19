import React, {PropsWithChildren, useEffect, useMemo, useState} from 'react';
import {FluentProvider} from '@fluentui/react-components';
import {AppTheme, defaultTheme, invert} from '../model/AppTheme.ts';

type ThemeContextProps = {
  currentTheme: AppTheme,
  setCurrentTheme: (theme: AppTheme) => void,
  /** White page with the scheme's page colour on the cards. */
  inverted: boolean,
  setInverted: (inverted: boolean) => void
}

export const ThemeContext = React.createContext<ThemeContextProps>({
  currentTheme: defaultTheme,
  setCurrentTheme: () => console.warn('setCurrentTheme called outside ThemeContextProvider'),
  inverted: false,
  setInverted: () => console.warn('setInverted called outside ThemeContextProvider')
});

/**
 * Holds the colour scheme and whether it is inverted, for this session only:
 * a reload goes back to the default scheme. Wraps FluentProvider and hands the page colour and the accent to
 * plain CSS as --app-page, --app-accent, --app-glow and --app-progress.
 */
export const ThemeContextProvider: React.FC<PropsWithChildren> = (props) => {
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);
  const [inverted, setInverted] = useState(false);
  const shown = useMemo(() => inverted ? invert(currentTheme) : currentTheme, [currentTheme, inverted]);
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--app-page', shown.page);
    root.setProperty('--app-accent', shown.accent);
    root.setProperty('--app-glow', `${shown.glow ?? 35}%`);
    root.setProperty('--app-progress', shown.progress);
  }, [shown]);
  return (
    <ThemeContext.Provider value={{currentTheme, setCurrentTheme, inverted, setInverted}}>
      <FluentProvider theme={shown.fluent} style={{backgroundColor: shown.page}}>
        {props.children}
      </FluentProvider>
    </ThemeContext.Provider>
  );
}
