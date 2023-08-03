import React, {PropsWithChildren} from "react";
import {LanguageInfo} from "../model/LanguageInfo.ts";
import flagOfIsrael from '/images/Flag_of_Israel.svg'

const initialLanguageProps: {currentLanguage: LanguageInfo} = {
  currentLanguage: {
    code: 'he',
    fullName: 'Hebrew',
    flagUrl: flagOfIsrael
  }
};

export const LanguageContext = React.createContext(initialLanguageProps);

export const LanguageContextProvider: React.FC<PropsWithChildren> = (props) => {
  return (
    <LanguageContext.Provider value={initialLanguageProps}>
      {props.children}
    </LanguageContext.Provider>
  );
}
