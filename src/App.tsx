import {useContext, useEffect, useState} from 'react'
import './App.css'
import {Button, Checkbox} from "@fluentui/react-components";
import {Dictionary} from './Dictionary';
import {Card} from "./model/Card.ts";
import {getForvoPronunciations} from "./service/PronounciationManager.ts";
import flagOfIsrael from '/images/Flag_of_Israel.svg'
import {LanguageContext} from "./context/LanguageContext.tsx";

const deckNames = [
  '01_NatureBeginner'
]

async function loadDeck(lang: string, deckName: string): Promise<Card[]> {
  const resp = await fetch(`wordfiles/${lang}/${deckName}.json`);
  if (!resp.ok) {
    throw new Error('Cannot load deck');
  }
  return await resp.json() as Card[];
}

function App() {
  const langContext = useContext(LanguageContext);
  const [count, setCount] = useState(0)
  const [deck, setDeck] = useState([] as Card[])
  const deckName = deckNames[0];

  useEffect(() => {
    loadDeck(langContext.currentLanguage, deckName).then(newDeck => setDeck(newDeck));
  }, [])


  const getProno = async () =>  {
    const resp = await getForvoPronunciations('fi', 'puu');
    console.log(resp.ok);
    console.log(resp);
    const body = await resp.json();

    console.log(body);
  }

  return (
    <>
      <h1>Flashcards</h1>
      <div>
        <img src={flagOfIsrael} className="logo" alt="Flag" />
      </div>
      <Dictionary cards={deck}/>
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
