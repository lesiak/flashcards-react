import React, {useContext} from 'react';
import {
  Avatar, Button, Image,
  makeStyles,
  Menu, MenuDivider, MenuGroupHeader, MenuItem,
  MenuItemCheckbox, MenuItemLink, MenuItemRadio,
  MenuList,
  MenuPopover,
  MenuTrigger,
  shorthands,
  SelectTabEventHandler,
  Tab,
  TabList,
  TabValue
} from '@fluentui/react-components';

import {PaintBrushRegular, PersonRegular} from '@fluentui/react-icons';
import {LanguageContext} from './context/LanguageContext.tsx';
import {ThemeContext} from './context/ThemeContext.tsx';
import {appThemes} from './model/AppTheme.ts';
import {LanguageInfo, appLangGroups} from './model/LanguageInfo.ts';

type NavBarProps = {
  selectedTab: TabValue,
  onTabSelect?: SelectTabEventHandler
}

const useStyles = makeStyles({
  root: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    ...shorthands.padding("10px", "20px"),
    columnGap: "20px",
  },
  rightIcons: {
    alignItems: "center",
    display: "flex",
    columnGap: "12px",
  },
  circularImg: {
    objectFit: 'cover'
  },
  swatches: {
    display: 'flex',
    width: '48px',
    height: '16px',
    borderRadius: '3px',
    overflow: 'hidden',
    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.12)',
  },
  swatch: {
    flexGrow: 1,
  },
});

/** Picks the colour scheme for this session; the menu shows each scheme's colours. */
const ThemeMenu: React.FC = () => {
  const {currentTheme, setCurrentTheme, inverted, setInverted} = useContext(ThemeContext);
  const styles = useStyles();
  return <Menu checkedValues={{theme: [currentTheme.id], layout: inverted ? ['inverted'] : []}}
               onCheckedValueChange={(_, {name, checkedItems}) => {
                 if (name === 'layout') {
                   setInverted(checkedItems.includes('inverted'));
                 } else {
                   setCurrentTheme(appThemes.find((t) => t.id === checkedItems[0]) ?? currentTheme);
                 }
               }}>
    <MenuTrigger disableButtonEnhancement>
      <Button appearance="subtle" shape="circular" icon={<PaintBrushRegular/>} aria-label="Colour scheme"/>
    </MenuTrigger>
    <MenuPopover>
      <MenuList>
        <MenuGroupHeader>Colour scheme</MenuGroupHeader>
        {appThemes.map((theme) =>
          <MenuItemRadio key={theme.id} name="theme" value={theme.id}
                         secondaryContent={<span className={styles.swatches}>
                           {theme.swatches.map((c) => <span key={c} className={styles.swatch} style={{backgroundColor: c}}/>)}
                         </span>}>
            {theme.name}
          </MenuItemRadio>)}
        <MenuDivider/>
        <MenuItemCheckbox name="layout" value="inverted">Inverted: white page, tinted cards</MenuItemCheckbox>
      </MenuList>
    </MenuPopover>
  </Menu>
}

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
    </TabList>

    <div className={styles.rightIcons}>
      <ThemeMenu/>

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
            {appLangGroups.map((group, i) =>
              <React.Fragment key={group[0].code}>
                {i > 0 && <MenuDivider/>}
                {group.map(lang => <ChangeLanguageMenuItem key={lang.code}
                                                           lang={lang}
                                                           onLangClicked={lang => setCurrentLanguage(lang)}/>)}
              </React.Fragment>)}
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  </nav>
}