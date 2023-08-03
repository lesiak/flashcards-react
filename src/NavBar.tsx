import {makeStyles, shorthands, Tab, TabList, TabValue} from '@fluentui/react-components';
import React from 'react';
import {SelectTabEventHandler} from '@fluentui/react-tabs';

type NavBarProps = {
  selectedTab: TabValue,
  onTabSelect?: SelectTabEventHandler
}

const useStyles = makeStyles({
  root: {
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    ...shorthands.padding("10px", "20px"),
    rowGap: "20px",
  },
});

export const NavBar: React.FC<NavBarProps> = ({selectedTab, onTabSelect}) => {
  const styles = useStyles();

  return <nav className={styles.root}>
    <TabList selectedValue={selectedTab} onTabSelect={onTabSelect}>
      <Tab value="homeTab" autoFocus={true}>Home</Tab>
      <Tab value="dictionaryTab">Dictionary</Tab>
    </TabList>
  </nav>
}