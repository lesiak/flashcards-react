import {useContext, useState} from 'react'
import './App.css'
import {
  Button,
  Checkbox
} from "@fluentui/react-components";
import {LanguageContext} from "./context/LanguageContext.tsx";
import {getForvoPronunciations} from "./service/PronounciationManager.ts";
import {ForvoResponse} from './model/forvo/Forvo.ts';


export function HomePage() {
  const {currentLanguage} = useContext(LanguageContext);
  const [count, setCount] = useState(0)

  const getProno = async () => {
    const resp = await getForvoPronunciations('fi', 'puu');
    console.log(resp.ok);
    const body: ForvoResponse = await resp.json();
    console.log("AAA respJson", body);
    console.log("AAA respJson items", body.items);
  }

  return (
    <>
      <h1>Flashcards</h1>
      <div>
        <img src={currentLanguage.flagUrl} className="logo" alt="Flag"/>
      </div>
      <Checkbox label="My Checkbox"/>
      <Button onClick={getProno}>Check Get Prono</Button>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  )
}


