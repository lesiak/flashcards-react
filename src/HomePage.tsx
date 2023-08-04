import { useContext, useState } from 'react'
import './App.css'
import {
    Button,
    Checkbox
} from "@fluentui/react-components";
import { LanguageContext } from "./context/LanguageContext.tsx";
import { getForvoPronunciations } from "./service/PronounciationManager.ts";

export function HomePage() {
    const {currentLanguage, changeLanguage} = useContext(LanguageContext);
    const [count, setCount] = useState(0)

    const getProno = async () => {
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
                <img src={currentLanguage.flagUrl} className="logo" alt="Flag" onClick={changeLanguage}/>
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


