import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  CogIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  MoonIcon,
  SunIcon,
  PencilIcon,
} from "@heroicons/react/solid";
import {
  LightningBoltIcon,
  LoginIcon
} from "@heroicons/react/outline";
import { CSSTransition } from "react-transition-group";
import { useSelector } from "react-redux";
import { useTheme } from "next-themes";

import "../styles/AwesomeNavBar.module.css";
import BasicTooltip from "./Tooltip";

interface RootState {
  counter: Object
  users: UserState,
}
interface UserState {
  user: User,
  username: any
}
interface User {
  photoURL: string,
  displayName: string
}

function AwesomeNavBar() {

  // TS infers type: (state: RootState) => boolean
  const selectUser = (state: RootState) => state.users; 
  const { user, username } = useSelector(selectUser);
  const {theme, setTheme} = useTheme();

  return (
    <NavBar>
      <NavBarItem
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        icon={
          theme === "dark" ? (
            <BasicTooltip title="Dark Mode" placement="bottom">
              <MoonIcon className="bg-fun-blue-300 dark:text-blog-black w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125" />
            </BasicTooltip>
          ) : (
            <BasicTooltip title="Light Mode" placement="bottom">
              <SunIcon className="bg-fun-blue-300 dark:text-blog-black w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125" />
            </BasicTooltip>
          )
        }
      />

      <NavBarItem nextrouteurl>
        <Link href="/technology"> 
          <BasicTooltip title="Tech Stack" placement="bottom">
            <LightningBoltIcon className="bg-fun-blue-300 dark:text-blog-black w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125" />
          </BasicTooltip>
        </Link>
      </NavBarItem>

      {/* user is not signed-in or has not created username */}
      {!username && (
        <NavBarItem nextrouteurl>
          <Link href="/enter"> 
              <BasicTooltip title="Login" placement="bottom">
                <LoginIcon className="bg-fun-blue-300 dark:text-blog-black w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125" />
              </BasicTooltip>
          </Link>
        </NavBarItem>
      )}

      {/* user is signed-in and has username */}
      {username && (
        <>
          <NavBarItem nextrouteurl>
            <Link href="/admin"> 
              <BasicTooltip title="Write a post" placement="bottom">
                <PencilIcon className="bg-fun-blue-300 dark:text-blog-black w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125" />
              </BasicTooltip>
            </Link>
          </NavBarItem>

        {/* user condition is ther because image src url is missing when clicking on sign out */}
          {user && <NavBarItem nextrouteurl>
            <BasicTooltip title={user?.displayName} placement="bottom">
              <div className="w-[calc(5rem_*_0.5)] h-[calc(5rem_*_0.5)] rounded-full cursor-pointer flex items-center overflow-hidden">
                <Link href={`/${username}`} >
                  <Image width={200} height={200} src={user?.photoURL} alt="" />
                </Link>
              </div>
            </BasicTooltip>
          </NavBarItem> 
          }

        </>
      )}

      <NavBarItem
        icon={
          <ChevronDownIcon className="bg-fun-blue-300 dark:text-blog-black w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125" />
        }
      >
        <DropdownMenu />
      </NavBarItem>
    </NavBar>
  );
}

function NavBar({ children }) {
  return (
    <nav className="fixed top-0 w-full h-16 py-0 px-4
            bg-blog-white 
            dark:bg-fun-blue-600 dark:text-blog-white
            drop-shadow-lg
            hover:drop-shadow-xl
            z-50 
            flex
            flex-row
          ">
      <div className="basis-1/2 md:basis-1/3 self-strech flex items-center md:text-2xl m-1">
          <Link href="/">     
            <a className="py-4">{`Swapnil's Notes`}</a>
          </Link>
      </div>
      <ul className="w-full h-full flex justify-end">{children}</ul>
    </nav>
  );
}

function DropdownMenu() {
  const selectUser = (state: RootState) => state.users; 
  const { user, username } = useSelector(selectUser);
  
  const [activeMenu, setActiveMenu] = useState("main");
  const [menuHeight, setMenuHeight] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMenuHeight(dropdownRef.current?.offsetHeight);
  }, [])

  function calcHeight(el) {
      // const { height } = el.getBoundingClientRect();
      const height = el.offsetHeight;
      setMenuHeight(height);
  }

  function DropdownItem(props) {
    
    return (
      <a href="#" className="flex h-12 p-2 rounded-lg items-center 
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
        {username && 
            (<DropdownItem>
              <Link href={`/${username}`}>
                <div className="flex items-center gap-x-1">
                  <div className="w-9 h-9 rounded-full cursor-pointer flex items-center overflow-hidden">
                    <Image width={200} height={200} src={user?.photoURL} alt="" />
                  </div>
                  My Profile
                </div>
              </Link>
            </DropdownItem>)
          }
          <DropdownItem leftIcon={<LoginIcon className="w-5 h-5"/>}>
            <Link href="/enter">Login Page</Link>
          </DropdownItem>
          <DropdownItem
            leftIcon={<CogIcon className="w-5 h-5"/>}
            rightIcon={<ChevronRightIcon className="w-5 h-5"/>}
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
          <DropdownItem goToMenu="main" leftIcon={<ChevronLeftIcon className="w-5 h-5"/>}>
            <h2>My Tutorial</h2>
          </DropdownItem>
          <DropdownItem leftIcon={<LightningBoltIcon className="w-5 h-5"/>}>HTML</DropdownItem>
          <DropdownItem leftIcon={<LightningBoltIcon className="w-5 h-5"/>}>CSS</DropdownItem>
          <DropdownItem leftIcon={<LightningBoltIcon className="w-5 h-5"/>}>
            JavaScript
          </DropdownItem>
          <DropdownItem leftIcon={<LightningBoltIcon className="w-5 h-5"/>}>Awesome!</DropdownItem>
        </div>
      </CSSTransition>
    </div>
  );
}

function NavBarItem(props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex">
      <div className="w-[calc(4rem_*_0.8)] flex items-center justify-center" {...props}>
         {props.nextrouteurl && props.children}
         {!props.nextrouteurl && <div className="w-[calc(5rem_*_0.5)] h-[calc(5rem_*_0.5)]" onClick={() => setOpen(!open)}>{props.icon}</div>}
         {open && props.children}
      </div>
    </div>
  );
}

export default AwesomeNavBar;
