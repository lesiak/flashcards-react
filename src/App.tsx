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
import {HomePage} from './HomePage.tsx';
import {LanguageInfo} from './model/LanguageInfo.ts';

const deckNames = [
  '01_NatureBeginner',
  '02_Numbers1to5'
]

async function loadDeck(lang: string, deckName: string): Promise<Card[]> {
  const deckUrl = `wordfiles/${lang}/${deckName}.json`;
  const resp = await fetch(deckUrl);
  if (!resp.ok) {
    throw new Error(`Cannot load deck ${deckUrl}`);
  }
  return await resp.json() as Card[];
}

function loadAllDecksIgnoringErrors(lang: LanguageInfo, deckNames: string[]): Promise<Card[][]> {
  const loadDeckIgnoringErrors = (deckName: string) => loadDeck(lang.code, deckName)
    .catch(e => {
      console.log('AAA', e);
      return [];
    });

  const loadTasks = deckNames.map(loadDeckIgnoringErrors);
  return Promise.all(loadTasks);
}

function App() {
  const {currentLanguage} = useContext(LanguageContext);
  const [_, setDeck] = useState([] as Card[])
  const [allCards, setAllCards] = useState([] as Card[])
  const deckIdx = 0;
  const [selectedTab, setSelectedTab] = useState<TabValue>("homeTab");

  const onTabSelect = (_: SelectTabEvent, data: SelectTabData) => {
    setSelectedTab(data.value);
  };

  useEffect(() => {
    async function getUserInfo() {
      const response = await fetch('/.auth/me');
      const payload = await response.json();
      const {clientPrincipal} = payload;
      return clientPrincipal;
    }

    (async () => {
      console.log(await getUserInfo());
    })();
  }, [])

  useEffect(() => {

    loadAllDecksIgnoringErrors(currentLanguage, deckNames).then(values => {
        const newAllCards = values.flatMap(v => v)
        setAllCards(newAllCards);
        setDeck(values[deckIdx]);
      })
    }, [currentLanguage.code])

    return (
      <>
        <NavBar selectedTab={selectedTab} onTabSelect={onTabSelect}/>
        {selectedTab === 'homeTab' && <HomePage/>}
        {selectedTab === 'dictionaryTab' && <Dictionary cards={allCards} currentLanguage={currentLanguage}/>}
      </>
    )
  }

  export default App
