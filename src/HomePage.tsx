import React, {useContext, useState} from 'react'
import {LanguageContext} from "./context/LanguageContext.tsx";
import {Lesson, LessonGroup} from './model/Lesson';
import {LessonPage} from './LessonPage.tsx';
import './App.css'
import {LessonChooser} from './LessonChooser.tsx';

interface HomePageProps {
  groups: LessonGroup[];
}

export const HomePage: React.FC<HomePageProps> = ({groups}) => {
  const {currentLanguage} = useContext(LanguageContext);
  const [currentLesson, setCurrentLesson] = useState(null as Lesson | null);

  return (
    <>
      {!currentLesson && <LessonChooser
          groups={groups}
          onLessonSelected={setCurrentLesson}/>}
      {currentLesson && <LessonPage currentLanguage={currentLanguage}
                                    lesson={currentLesson}
                                    onClose={() => setCurrentLesson(null)}/>}
    </>
  )
}
