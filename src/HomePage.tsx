import React, {useContext, useEffect, useState} from 'react'
import {
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {LanguageContext} from "./context/LanguageContext.tsx";
import {Course, Lesson, Section} from './model/Lesson';
import {LessonPage} from './LessonPage.tsx';
import './App.css'
import {LessonChooser} from './LessonChooser.tsx';
import {IndexCard} from './IndexCard.tsx';
import {loadStoredCourse, storeCourse} from './service/Settings.ts';

interface HomePageProps {
  courses: Course[];
}

const useStyles = makeStyles({
  crumbs: {
    marginTop: tokens.spacingVerticalL,
    marginBottom: tokens.spacingVerticalS,
    marginLeft: '0.5rem',
  },
});

interface Crumb {
  label: string;
  /** Missing on the last crumb, which is where the user is. */
  onClick?: () => void;
}

const Crumbs: React.FC<{crumbs: Crumb[]}> = ({crumbs}) => {
  const styles = useStyles();
  return (
    <Breadcrumb aria-label="Where you are" size="large" className={styles.crumbs}>
      {crumbs.map((crumb, i) =>
        <React.Fragment key={crumb.label}>
          {i > 0 && <BreadcrumbDivider/>}
          <BreadcrumbItem>
            <BreadcrumbButton current={!crumb.onClick} onClick={crumb.onClick}>{crumb.label}</BreadcrumbButton>
          </BreadcrumbItem>
        </React.Fragment>)}
    </Breadcrumb>
  );
};

const deckCount = (sections: Section[]) => sections.reduce((n, s) => n + s.lessons.length, 0);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const firstImage = (lessons: Lesson[]) => lessons.find((l) => l.image)?.image;

/**
 * Course -> section -> deck -> cards. The course is remembered across
 * restarts; a course with a single section skips the section step.
 */
export const HomePage: React.FC<HomePageProps> = ({courses}) => {
  const {currentLanguage} = useContext(LanguageContext);
  const [courseId, setCourseId] = useState<string | null>(loadStoredCourse);
  const [sectionName, setSectionName] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  // The decks reload for a new language; a lesson from the old one must not stay open.
  useEffect(() => {
    setCurrentLesson(null);
  }, [currentLanguage.code]);

  const course = courses.find((c) => c.id === courseId) ?? null;
  const section = course === null ? null
    : course.sections.length === 1 ? course.sections[0]
    : course.sections.find((s) => s.name === sectionName) ?? null;

  const chooseCourse = (c: Course) => {
    setCourseId(c.id);
    storeCourse(c.id);
    setSectionName(null);
  };
  // Browsing the courses does not forget the stored one; only picking another replaces it.
  const showCourses = () => {
    setCourseId(null);
    setSectionName(null);
  };
  const showSections = () => setSectionName(null);

  if (currentLesson) {
    return <LessonPage currentLanguage={currentLanguage}
                       lesson={currentLesson}
                       onClose={() => setCurrentLesson(null)}/>;
  }

  if (courses.length === 0) {
    return null;
  }

  if (!course) {
    return (
      <>
        <Crumbs crumbs={[{label: 'Courses'}]}/>
        <div className="fl-grid">
          {courses.map((c) =>
            <div key={c.id} className="lesson-card fl-span4">
              <IndexCard title={c.name}
                         subtitle={plural(deckCount(c.sections), 'deck')}
                         image={firstImage(c.sections.flatMap((s) => s.lessons))}
                         onClick={() => chooseCourse(c)}/>
            </div>)}
        </div>
      </>
    );
  }

  if (!section) {
    return (
      <>
        <Crumbs crumbs={[{label: 'Courses', onClick: showCourses}, {label: course.name}]}/>
        <div className="fl-grid">
          {course.sections.map((s) =>
            <div key={s.name} className="lesson-card fl-span4">
              <IndexCard title={s.name}
                         subtitle={plural(s.lessons.length, 'deck')}
                         image={firstImage(s.lessons)}
                         onClick={() => setSectionName(s.name)}/>
            </div>)}
        </div>
      </>
    );
  }

  const crumbs: Crumb[] = [{label: 'Courses', onClick: showCourses}];
  if (course.sections.length === 1) {
    crumbs.push({label: course.name});
  } else {
    crumbs.push({label: course.name, onClick: showSections}, {label: section.name});
  }
  return (
    <>
      <Crumbs crumbs={crumbs}/>
      <LessonChooser lessons={section.lessons} onLessonSelected={setCurrentLesson}/>
    </>
  );
}
