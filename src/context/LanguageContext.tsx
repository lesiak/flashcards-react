import React, {PropsWithChildren, useState} from "react";
import {brazilianPortuguese, finnish, hebrew, LanguageInfo} from '../model/LanguageInfo.ts';

type LanguageContextProps = {
  currentLanguage: LanguageInfo,
  setCurrentLanguage: (lang: LanguageInfo) => void
}

const initialLanguageProps: LanguageContextProps = {
  currentLanguage: hebrew,
  setCurrentLanguage: () => {}
};

export const appLangs = [finnish, hebrew, brazilianPortuguese];

export const LanguageContext = React.createContext(initialLanguageProps);

export const LanguageContextProvider: React.FC<PropsWithChildren> = (props) => {
  const [currentLanguage, setCurrentLanguage] = useState(finnish);
  return (
    <LanguageContext.Provider value={{
      currentLanguage: currentLanguage,
      setCurrentLanguage: setCurrentLanguage
    }}>
      {props.children}
    </LanguageContext.Provider>
  );
}
