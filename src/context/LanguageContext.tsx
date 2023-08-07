import React, {PropsWithChildren, useState} from 'react';
import { finnish, LanguageInfo } from '../model/LanguageInfo.ts';

type LanguageContextProps = {
  currentLanguage: LanguageInfo,
  setCurrentLanguage: (lang: LanguageInfo) => void
}

const initialLanguageProps: LanguageContextProps = {
  currentLanguage: finnish,
  setCurrentLanguage: () => {}
};


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
