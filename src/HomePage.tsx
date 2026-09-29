import React, {useContext, useState} from 'react'
import {LanguageContext} from "./context/LanguageContext.tsx";
import {Lesson} from './model/Lesson';
import {LessonPage} from './LessonPage.tsx';
import './App.css'
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
      {currentLesson && <LessonPage currentLanguage={currentLanguage}
                                    lesson={currentLesson}
                                    onClose={() => setCurrentLesson(null)}/>}
    </>
  )
}
