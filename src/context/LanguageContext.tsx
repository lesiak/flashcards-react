import React, {PropsWithChildren, useCallback, useState} from 'react';
import {appLangs, finnish, LanguageInfo} from '../model/LanguageInfo.ts';
import {loadStoredLanguage, storeLanguage} from '../service/Settings.ts';

type LanguageContextProps = {
  currentLanguage: LanguageInfo,
  setCurrentLanguage: (lang: LanguageInfo) => void
}

const initialLanguageProps: LanguageContextProps = {
  currentLanguage: finnish,
  setCurrentLanguage: () => console.warn('setCurrentLanguage called outside LanguageContextProvider')
};

/** The language picked last time, when it is still one the app offers. */
function initialLanguage(): LanguageInfo {
  const code = loadStoredLanguage();
  return appLangs.find((lang) => lang.code === code) ?? finnish;
}

export const LanguageContext = React.createContext(initialLanguageProps);

export const LanguageContextProvider: React.FC<PropsWithChildren> = (props) => {
  const [currentLanguage, setLanguage] = useState(initialLanguage);
  const setCurrentLanguage = useCallback((lang: LanguageInfo) => {
    setLanguage(lang);
    storeLanguage(lang.code);
  }, []);
  return (
    <LanguageContext.Provider value={{
      currentLanguage: currentLanguage,
      setCurrentLanguage: setCurrentLanguage
    }}>
      {props.children}
    </LanguageContext.Provider>
  );
}
