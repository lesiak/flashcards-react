import {useEffect, useState} from 'react'
import './App.css'

import {Checkbox} from "@fluentui/react-components";
import {Dictionary} from './Dictionary';
import {Card} from "./model/Card.ts";

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


  return (
    <>
      <h1>Flashcards</h1>
      <Dictionary cards={deck}/>
      <Checkbox label="My Checkbox"/>

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
