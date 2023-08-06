import React, {useContext, useState} from 'react'
import {LanguageContext} from "./context/LanguageContext.tsx";
import {Lesson} from './model/Lesson';
import {LessonCard} from './LessonCard.tsx';
import {LessonPage} from './LessonPage.tsx';
import './App.css'
import {Button} from '@fluentui/react-components';

interface HomePageProps {
  lessons: Lesson[];
}

export const HomePage: React.FC<HomePageProps> = ({lessons}) => {
  const {currentLanguage} = useContext(LanguageContext);
  const [currentLesson, setCurrentLesson] = useState(null as Lesson | null);

  return (
    <>
      {!currentLesson && lessons.map(lesson =>
        <div key={`${currentLanguage.code}-${lesson.name}`} className="lesson-card" onClick={() => setCurrentLesson(lesson)}>
        <LessonCard lesson={lesson}/>
        </div>)
      }
      {currentLesson && <>
          <Button onClick={() => setCurrentLesson(null)}>Close Lesson</Button>
          <LessonPage currentLanguage={currentLanguage} lesson={currentLesson}/>
      </>
      }
    </>
  )
}


