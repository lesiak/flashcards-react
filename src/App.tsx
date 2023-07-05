import {useEffect, useState} from 'react'
import './App.css'

import {Button, Checkbox} from "@fluentui/react-components";
import {Dictionary} from './Dictionary';
import {Card} from "./model/Card.ts";
import {getForvoPronunciations} from "./service/PronounciationManager.ts";

async function loadDeck(): Promise<Card[]> {
  const resp = await fetch('wordfiles/01_NatureBeginner.json');
  if (!resp.ok) {
    throw new Error('Cannot load deck');
  }
  return await resp.json() as Card[];
}

function App() {
  const [count, setCount] = useState(0)
  const [deck, setDeck] = useState([] as Card[])

  useEffect(() => {
    loadDeck().then(newDeck => setDeck(newDeck));
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
