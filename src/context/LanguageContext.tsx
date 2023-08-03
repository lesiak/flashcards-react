import React, {PropsWithChildren, useState} from "react";
import {brazilianPortuguese, finnish, hebrew, LanguageInfo} from '../model/LanguageInfo.ts';

type LanguageContextProps = {
  currentLanguage: LanguageInfo,
  changeLanguage: () => void
}

const initialLanguageProps: LanguageContextProps = {
  currentLanguage: hebrew,
  changeLanguage: () => {}
};

const appLangs = [finnish, hebrew, brazilianPortuguese];

export const LanguageContext = React.createContext(initialLanguageProps);

export const LanguageContextProvider: React.FC<PropsWithChildren> = (props) => {
  const [currentLanguageIdx, setCurrentLanguageIdx] = useState(0);
  const currentLanguage = appLangs[currentLanguageIdx];
  return (
    <LanguageContext.Provider value={{
      currentLanguage: currentLanguage,
      changeLanguage: () => setCurrentLanguageIdx((prevIdx) => (prevIdx + 1) % appLangs.length )
    }}>
      {props.children}
    </LanguageContext.Provider>
  );
}
