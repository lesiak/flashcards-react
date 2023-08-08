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
import {loadAllDLessonsIgnoringErrors, loadDeckNames} from './service/DeckLoader.ts';
import {Lesson} from './model/Lesson.ts';

function App() {
  const {currentLanguage} = useContext(LanguageContext);
  const [lessons, setLessons] = useState([] as Lesson[])
  const [allCards, setAllCards] = useState([] as Card[])
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
    const fetchData = async () => {
      const deckNames = await loadDeckNames();
      const lessons = await loadAllDLessonsIgnoringErrors(currentLanguage, deckNames);
      setLessons(lessons);
      const newAllCards = lessons.flatMap(l => l.cards)
      setAllCards(newAllCards);
    }
    fetchData().catch(console.error);
    }, [currentLanguage.code])

    return (
      <>
        <NavBar selectedTab={selectedTab} onTabSelect={onTabSelect}/>
        {selectedTab === 'homeTab' && <HomePage lessons={lessons}/>}
        {selectedTab === 'dictionaryTab' && <Dictionary cards={allCards} currentLanguage={currentLanguage}/>}
      </>
    )
  }

  export default App
