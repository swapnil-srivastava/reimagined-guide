import Link from "next/link";
import Image from "next/legacy/image";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faSun,
  faMoon,
  faArrowRightToBracket,
  faPencil,
  faChevronDown,
  faCog,
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { CSSTransition } from "react-transition-group";
import { useSelector } from "react-redux";
import { useTheme } from "next-themes";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import "../styles/AwesomeNavBar.module.css";
import BasicTooltip from "./Tooltip";
import RoundButton from "./RoundButton";
import { RootState } from "../lib/interfaces/interface";

function AwesomeNavBar() {
  // TS infers type: (state: RootState) => boolean
  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;
  const { theme, setTheme } = useTheme();
  const { locales, asPath, locale: nextLocale } = useRouter();
  const [currentLocale, setCurrentLocale] = useState(nextLocale);

  const handleChange = (event: SelectChangeEvent) => {
    setCurrentLocale(event.target.value as string);
  };

  return (
    <NavBar>
      <FormControl>
        <InputLabel
          id="demo-simple-select-label"
          className="dark:text-blog-white"
        >
          Locale
        </InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          className="dark:text-blog-white"
          value={currentLocale}
          label="Locale"
          onChange={handleChange}
        >
          {locales.map((locale) => (
            <MenuItem
              value={locale}
              key={locale}
              className="dark:text-blog-white dark:bg-fun-blue-600 hover:brightness-125"
            >
              <Link href={asPath} locale={locale} legacyBehavior>
                {locale}
              </Link>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <NavBarItem
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        icon={
          theme === "dark" ? (
            <BasicTooltip title="Dark Mode" placement="bottom">
              <RoundButton>
                <FontAwesomeIcon icon={faMoon} size="lg" />
              </RoundButton>
            </BasicTooltip>
          ) : (
            <BasicTooltip title="Light Mode" placement="bottom">
              <RoundButton>
                  <FontAwesomeIcon icon={faSun} size="lg" />
              </RoundButton>
            </BasicTooltip>
          )
        }
      />

      <NavBarItem nextrouteurl>
        <Link href="/technology">
          <BasicTooltip title="Tech Stack" placement="bottom">
            <RoundButton>
              <FontAwesomeIcon icon={faBolt} size="lg" />
            </RoundButton>
          </BasicTooltip>
        </Link>
      </NavBarItem>

      {/* user is not signed-in or has not created username */}
      {!profile?.username && (
        <NavBarItem nextrouteurl>
          <Link href="/enter">
            <BasicTooltip title="Login" placement="bottom">
              <RoundButton>
                <FontAwesomeIcon icon={faArrowRightToBracket} size="lg" />
              </RoundButton>
            </BasicTooltip>
          </Link>
        </NavBarItem>
      )}

      {/* user is signed-in and has username */}
      {profile?.username && (
        <>
          <NavBarItem nextrouteurl>
            <Link href="/admin">
              <BasicTooltip title="Write a post" placement="bottom">
                <RoundButton>
                  <FontAwesomeIcon icon={faPencil} size="lg" />
                </RoundButton>
              </BasicTooltip>
            </Link>
          </NavBarItem>

          {/* user condition is ther because image src url is missing when clicking on sign out */}
          {profile?.username && (
            <NavBarItem nextrouteurl>
              <BasicTooltip title={profile?.full_name} placement="bottom">
                <div className="w-[calc(5rem_*_0.5)] h-[calc(5rem_*_0.5)] rounded-full cursor-pointer flex items-center overflow-hidden">
                  <Link href={`/${profile?.username}`} legacyBehavior>
                    <Image
                      width={200}
                      height={200}
                      src={profile?.avatar_url}
                      alt=""
                    />
                  </Link>
                </div>
              </BasicTooltip>
            </NavBarItem>
          )}
        </>
      )}

      <NavBarItem
        icon={
          <RoundButton>
            <FontAwesomeIcon icon={faChevronDown} size="lg" />
          </RoundButton>
        }
      >
        <DropdownMenu />
      </NavBarItem>
    </NavBar>
  );
}

function NavBar({ children }) {
  return (
    <nav
      className="w-full h-20 py-0 px-4
            bg-blog-white 
            dark:bg-fun-blue-600 dark:text-blog-white
            drop-shadow-lg
            hover:drop-shadow-xl
            z-50 
            flex
            flex-row
          "
    >
      <div className="basis-1/2 md:basis-1/3 self-strech flex items-center md:text-2xl m-1">
        <Link href="/" legacyBehavior>
          <Image
            width={50}
            height={50}
            src="/swapnilsrivastava_logo_Letter_S.png"
            alt="Srivastava's Notes"
          />
        </Link>
      </div>
      <ul className="w-full h-full flex justify-end items-center">
        {children}
      </ul>
    </nav>
  );
}

function DropdownMenu() {
  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  const [activeMenu, setActiveMenu] = useState("main");
  const [menuHeight, setMenuHeight] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMenuHeight(dropdownRef.current?.offsetHeight);
  }, []);

  function calcHeight(el) {
    const height = el.offsetHeight;
    setMenuHeight(height);
  }

  function DropdownItem(props) {
    return (
      <a
        href="#"
        className="flex h-12 p-2 rounded-lg items-center 
      transition-background duration-500 hover:bg-fun-blue-300 gap-x-1"
        onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}
      >
        {props.leftIcon && (
          <span className="bg-fun-blue-300 dark:text-blog-black w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125">
            {props.leftIcon}
          </span>
        )}

        {props.children}

        {props.rightIcon && (
          <span className="ml-auto bg-fun-blue-300 dark:text-blog-black w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125">
            {props.rightIcon}
          </span>
        )}
      </a>
    );
  }

  return (
    <div
      className="absolute top-12 w-80 -translate-x-2/4 
          overflow-hidden rounded-lg 
          border border-blog-white
          transition-height
          bg-blog-white 
          dark:bg-fun-blue-600 dark:text-blog-white
          dark:border-fun-blue-500 
          drop-shadow-lg
          hover:drop-shadow-xl
          z-55"
      style={{ height: menuHeight }}
      ref={dropdownRef}
    >
      <CSSTransition
        in={activeMenu === "main"}
        timeout={500}
        classNames="menu-primary"
        unmountOnExit
        onEnter={(el) => calcHeight(el)}
        onEntered={(el) => calcHeight(el)}
        onEntering={(el) => calcHeight(el)}
      >
        <div className="menu p-4">
          {profile?.id && (
            <DropdownItem>
              <Link href={`/${profile?.username}`} legacyBehavior>
                <div className="flex items-center gap-x-1">
                  <div className="w-9 h-9 rounded-full cursor-pointer flex items-center overflow-hidden">
                    <Image
                      width={200}
                      height={200}
                      src={profile?.avatar_url}
                      alt={profile?.full_name}
                    />
                  </div>
                  My Profile
                </div>
              </Link>
            </DropdownItem>
          )}

          <DropdownItem
            leftIcon={
              <RoundButton>
                <FontAwesomeIcon icon={faArrowRightToBracket} size="lg" />
              </RoundButton>
            }
          >
            <Link href="/enter" legacyBehavior>
              {profile?.id && profile?.id ? "Sign Out" : "Login Page"}
            </Link>
          </DropdownItem>

          <DropdownItem
            leftIcon={
              <RoundButton>
                <FontAwesomeIcon icon={faCog} size="lg" />
              </RoundButton>
            }
            rightIcon={
              <RoundButton>
                <FontAwesomeIcon icon={faChevronRight} size="lg" />
              </RoundButton>
            }
            goToMenu="settings"
          >
            Settings
          </DropdownItem>
        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === "settings"}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={(el) => calcHeight(el)}
        onEntered={(el) => calcHeight(el)}
        onEntering={(el) => calcHeight(el)}
      >
        <div className="menu p-4">
          <DropdownItem
            goToMenu="main"
            leftIcon={
              <RoundButton>
                <FontAwesomeIcon icon={faChevronLeft} size="lg" />
              </RoundButton>
            }
          >
            <h2>My Tutorial</h2>
          </DropdownItem>
          <DropdownItem
            leftIcon={
              <RoundButton>
                <FontAwesomeIcon icon={faBolt} size="lg" />
              </RoundButton>
            }
          >
            HTML
          </DropdownItem>
          <DropdownItem
            leftIcon={
              <RoundButton>
                <FontAwesomeIcon icon={faBolt} size="lg" />
              </RoundButton>
            }
          >
            CSS
          </DropdownItem>
          <DropdownItem
            leftIcon={
              <RoundButton>
                <FontAwesomeIcon icon={faBolt} size="lg" />
              </RoundButton>
            }
          >
            JavaScript
          </DropdownItem>
          <DropdownItem
            leftIcon={
              <RoundButton>
                <FontAwesomeIcon icon={faBolt} size="lg" />
              </RoundButton>
            }
          >
            Awesome!
          </DropdownItem>
        </div>
      </CSSTransition>
    </div>
  );
}

function NavBarItem(props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex">
      <div
        className="w-[calc(4rem_*_0.8)] flex items-center justify-center"
        {...props}
      >
        {props.nextrouteurl && props.children}
        {!props.nextrouteurl && (
          <div
            className="w-[calc(5rem_*_0.5)] h-[calc(5rem_*_0.5)]"
            onClick={() => setOpen(!open)}
          >
            {props.icon}
          </div>
        )}
        {open && props.children}
      </div>
    </div>
  );
}

export default AwesomeNavBar;
