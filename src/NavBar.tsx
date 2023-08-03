import React from 'react';
import {
  Avatar,
  makeStyles,
  Menu,
  MenuItemLink,
  MenuList,
  MenuPopover,
  MenuTrigger,
  shorthands,
  Tab,
  TabList,
  TabValue
} from '@fluentui/react-components';

import {PersonRegular} from '@fluentui/react-icons';
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
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Avatar icon={<PersonRegular />} aria-label="Group" />
        </MenuTrigger>

        <MenuPopover>
          <MenuList>
            <MenuItemLink href="/logout">Logout</MenuItemLink>
          </MenuList>
        </MenuPopover>
      </Menu>

    </TabList>

  </nav>
}