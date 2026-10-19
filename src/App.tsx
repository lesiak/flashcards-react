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
import {loadDeckIndex, loadCourses} from './service/DeckLoader.ts';
import {Course} from './model/Lesson.ts';

function App() {
  const {currentLanguage} = useContext(LanguageContext);
  const [courses, setCourses] = useState([] as Course[])
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
    async function getApiMessage() {
      const response = await fetch('/api/message');
      const payload = await response;
      console.log('AAAA', response);
      return payload;
    }

    (async () => {
      console.log(await getApiMessage());
    })();
  }, [])


useEffect(() => {
    const fetchData = async () => {
      const index = await loadDeckIndex();
      const loaded = await loadCourses(currentLanguage.code, index);
      setCourses(loaded);
      setAllCards(loaded.flatMap(c => c.sections).flatMap(s => s.lessons).flatMap(l => l.cards));
    }
    fetchData().catch(console.error);
    }, [currentLanguage.code])

    return (
      <>
        <NavBar selectedTab={selectedTab} onTabSelect={onTabSelect}/>
        {selectedTab === 'homeTab' && <HomePage courses={courses}/>}
        {selectedTab === 'dictionaryTab' && <Dictionary cards={allCards} currentLanguage={currentLanguage}/>}
      </>
    )
  }

  export default App
