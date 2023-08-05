import React, {useContext} from 'react';
import {
  Avatar, Image,
  makeStyles,
  Menu, MenuGroupHeader, MenuItem,
  MenuItemLink,
  MenuList,
  MenuPopover,
  MenuTrigger,
  shorthands,
  Tab,
  TabList,
  TabValue
} from '@fluentui/react-components';

import {appLangs} from './context/LanguageContext.tsx';

import {PersonRegular} from '@fluentui/react-icons';
import {SelectTabEventHandler} from '@fluentui/react-tabs';
import {LanguageContext} from './context/LanguageContext.tsx';
import {LanguageInfo} from './model/LanguageInfo.ts';

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
  circularImg: {
    objectFit: 'cover'
  }
});

const ChangeLanguageMenuItem: React.FC<{lang: LanguageInfo,
  onLangClicked: (lang: LanguageInfo) => void}> = ({lang, onLangClicked}) => {
  return <MenuItem icon={<Image src={lang.flagUrl}
                         shape='circular'
                         bordered={true}
                         fit='cover'/>}
            onClick={() => onLangClicked(lang)}>{lang.fullName}</MenuItem>
}

export const NavBar: React.FC<NavBarProps> = ({selectedTab, onTabSelect}) => {
  const {currentLanguage, setCurrentLanguage} = useContext(LanguageContext);
  const styles = useStyles();

  return <nav className={styles.root}>
    <TabList selectedValue={selectedTab} onTabSelect={onTabSelect}>
      <Tab value="homeTab" autoFocus={true}>Home</Tab>
      <Tab value="dictionaryTab">Dictionary</Tab>
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Avatar icon={<PersonRegular/>} aria-label="Group"/>
        </MenuTrigger>

        <MenuPopover>
          <MenuList>
            <MenuItemLink href="/logout">Logout</MenuItemLink>
          </MenuList>
        </MenuPopover>
      </Menu>

      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Image src={currentLanguage.flagUrl}
                 shape='circular'
                 bordered={true}
                 height="32px"
                 width="32px"
                 className={styles.circularImg}
          />
        </MenuTrigger>

        <MenuPopover>
          <MenuList>
            <MenuGroupHeader>Select Language</MenuGroupHeader>
            {appLangs.map(lang => <ChangeLanguageMenuItem lang={lang}
                                                          onLangClicked={lang => setCurrentLanguage(lang)}/>)}
          </MenuList>
        </MenuPopover>
      </Menu>


    </TabList>

  </nav>
}