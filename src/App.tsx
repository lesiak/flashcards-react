import {useContext, useEffect, useState} from 'react'
import './App.css'
import {
  SelectTabData,
  SelectTabEvent,
  TabValue
} from "@fluentui/react-components";
import {Dictionary} from './Dictionary';
import {Card} from "./model/Card.ts";
import {LanguageContext} from "./context/LanguageContext.tsx";
import {NavBar} from './NavBar.tsx';
import { HomePage } from './HomePage.tsx';

const deckNames = [
  '01_NatureBeginner',
  '02_Numbers1to5'
]



async function loadDeck(lang: string, deckName: string): Promise<Card[]> {
  const resp = await fetch(`wordfiles/${lang}/${deckName}.json`);
  if (!resp.ok) {
    throw new Error('Cannot load deck');
  }
  return await resp.json() as Card[];
}

function App() {
  const {currentLanguage} = useContext(LanguageContext);
  const [deck, setDeck] = useState([] as Card[])
  const deckName = deckNames[0];
  const [selectedTab, setSelectedTab] = useState<TabValue>("homeTab");

  const onTabSelect = (_: SelectTabEvent, data: SelectTabData) => {
    setSelectedTab(data.value);
  };

  useEffect(() => {
    async function getUserInfo() {
      const response = await fetch('/.auth/me');
      const payload = await response.json();
      const { clientPrincipal } = payload;
      return clientPrincipal;
    }

    (async () => {
      console.log(await getUserInfo());
    })();
  }, [])

  useEffect(() => {
    loadDeck(currentLanguage.code, deckName).then(newDeck => setDeck(newDeck));
  }, [currentLanguage.code])




  return (
    <>
      <NavBar selectedTab={selectedTab} onTabSelect={onTabSelect} />
      {selectedTab === 'homeTab' && <HomePage />}
      {selectedTab === 'dictionaryTab' && <Dictionary cards={deck} currentLanguage={currentLanguage}/>}
    </>
  )
}

export default App
