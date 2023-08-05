import React, {useContext} from 'react'
import './App.css'
import {
  Button,
  Checkbox
} from "@fluentui/react-components";
import {LanguageContext} from "./context/LanguageContext.tsx";
import {getForvoPronunciations} from "./service/PronounciationManager.ts";
import {ForvoResponse} from './model/forvo/Forvo.ts';
import {Lesson} from './model/Lesson';
import {LessonCard} from './LessonCard.tsx';

interface HomePageProps {
  lessons: Lesson[];
}

export const HomePage: React.FC<HomePageProps> = ({lessons}) => {
  const {currentLanguage} = useContext(LanguageContext);

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
      {lessons.map(lesson =>
        <div key={`${currentLanguage.code}-${lesson.name}`} className="lesson-card">
        <LessonCard lesson={lesson}/>
        </div>)}
      <Checkbox label="My Checkbox"/>
      <Button onClick={getProno}>Check Get Prono</Button>
      <div>
        <img src={currentLanguage.flagUrl} className="logo" alt="Flag"/>
      </div>
    </>
  )
}


