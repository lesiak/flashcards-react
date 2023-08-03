import React, {PropsWithChildren} from "react";

const initialLanguageProps = {currentLanguage: 'he'};

export const LanguageContext = React.createContext(initialLanguageProps);

export const LanguageContextProvider: React.FC<PropsWithChildren> = (props) => {
  return (
    <LanguageContext.Provider value={initialLanguageProps}>
      {props.children}
    </LanguageContext.Provider>
  );
}
