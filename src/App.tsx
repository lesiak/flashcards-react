import {useState} from 'react'
import './App.css'

import {Checkbox} from "@fluentui/react-components";
import {Dictionary} from './Dictionary';
import {Card} from "./model/Card.ts";

const cards: Card[] = [
  {en: 'sun', he: 'שמש'},
  {en: 'moon', he: 'ירח'},
  {en: 'tree', he: 'עֵץ'}

];

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Flashcards</h1>
      <Dictionary cards={cards}/>
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
