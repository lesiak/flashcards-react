import {useContext, useEffect, useState} from 'react'
import './App.css'
import {
  Button,
  Checkbox,
  SelectTabData, SelectTabEvent,
  TabValue
} from "@fluentui/react-components";
import {Dictionary} from './Dictionary';
import {Card} from "./model/Card.ts";
import {getForvoPronunciations} from "./service/PronounciationManager.ts";
import {LanguageContext} from "./context/LanguageContext.tsx";
import {NavBar} from './NavBar.tsx';

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
  const {currentLanguage, changeLanguage} = useContext(LanguageContext);
  const [count, setCount] = useState(0)
  const [deck, setDeck] = useState([] as Card[])
  const deckName = deckNames[0];
  const [selectedTab, setSelectedTab] = useState<TabValue>("homeTab");

  const onTabSelect = (_: SelectTabEvent, data: SelectTabData) => {
    setSelectedTab(data.value);
  };

  useEffect(() => {
    loadDeck(currentLanguage.code, deckName).then(newDeck => setDeck(newDeck));
  }, [currentLanguage.code])


  const getProno = async () => {
    const resp = await getForvoPronunciations('fi', 'puu');
    console.log(resp.ok);
    console.log(resp);
    const body = await resp.json();

    console.log(body);
  }

  return (
    <>
      <NavBar selectedTab={selectedTab} onTabSelect={onTabSelect} />

      <h1>Flashcards</h1>
      <div>
        <img src={currentLanguage.flagUrl} className="logo" alt="Flag" onClick={changeLanguage}/>
      </div>


      <Dictionary cards={deck} currentLanguage={currentLanguage}/>
      <Checkbox label="My Checkbox"/>
      <Button onClick={getProno}>sasa</Button>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </>
  )
}

export default App
