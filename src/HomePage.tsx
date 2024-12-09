import React, {useContext, useState} from 'react'
import {LanguageContext} from "./context/LanguageContext.tsx";
import {Lesson} from './model/Lesson';
import {LessonIndexCard} from './LessonIndexCard.tsx';
import {LessonPage} from './LessonPage.tsx';
import './App.css'
import {Button} from '@fluentui/react-components';
import {LessonChooser} from './LessonChooser.tsx';

interface HomePageProps {
  lessons: Lesson[];
}

export const HomePage: React.FC<HomePageProps> = ({lessons}) => {
  const {currentLanguage} = useContext(LanguageContext);
  const [currentLesson, setCurrentLesson] = useState(null as Lesson | null);

  return (
    <>
      {!currentLesson && <LessonChooser
          lessons={lessons}
          onLessonSelected={setCurrentLesson}/>}
      {currentLesson && <>
          <Button onClick={() => setCurrentLesson(null)}>Close Lesson</Button>
          <LessonPage currentLanguage={currentLanguage} lesson={currentLesson}/>
      </>
      }
    </>
  )
}


