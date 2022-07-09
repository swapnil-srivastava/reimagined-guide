import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import {
  BeakerIcon,
  ChevronDownIcon,
  CogIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  LightningBoltIcon
} from "@heroicons/react/solid";
import { CSSTransition } from "react-transition-group";
import "../styles/AwesomeNavBar.module.css";

function AwesomeNavBar() {
  return (
    <NavBar>
      <NavBarItem
        nextRouteUrl={"/enter"}
        icon={
          <BeakerIcon className="bg-blue-400 w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-300 hover:filter hover:brightness-125" />
        }
      />
      <NavBarItem
        nextRouteUrl={"/technology"}
        icon={
          <ChevronDownIcon className="bg-blue-400 w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-300 hover:filter hover:brightness-125" />
        }
      >
        <DropdownMenu />
      </NavBarItem>
    </NavBar>
  );
}

function NavBar({ children }) {
  return (
    <nav className="fixed top-0 w-full h-16 py-0 px-4 bg-blue-600 text-blog-white">
      <ul className="w-full h-full flex justify-end">{children}</ul>
    </nav>
  );
}

function DropdownMenu() {
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
      <a
        href="#"
        className="flex h-12 p-2 rounded-lg items-center transition-background duration-300 hover:bg-blue-500"
        onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}
      >
        {props.leftIcon && (
          <span className="bg-blue-400 w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-300 hover:filter hover:brightness-125">
            {props.leftIcon}
          </span>
        )}

        {props.children}

        {props.rightIcon && (
          <span className="ml-auto bg-blue-400 w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-300 hover:filter hover:brightness-125">
            {props.rightIcon}
          </span>
        )}
      </a>
    );
  }

  return (
    <div
      className="absolute top-12 w-80 -translate-x-2/4 bg-blue-600 text-blog-white overflow-hidden rounded-lg border border-blue-500 transition-height"
      style={{ height: menuHeight }}
      ref={dropdownRef}
    >

        <CSSTransition
            in={activeMenu === 'main'}
            timeout={500}
            classNames="menu-primary"
            unmountOnExit
            onEnter={(el) => calcHeight(el)}
            onEntered={(el) => calcHeight(el)}
            onEntering={(el) => calcHeight(el)}
            onExit={(el) => calcHeight(el)}
            >
        
            <div className="menu p-4">

                <DropdownItem>My Profile</DropdownItem>
                <DropdownItem
                    leftIcon={<CogIcon />}
                    rightIcon={<ChevronRightIcon />}
                    goToMenu="settings">
                    Settings
                </DropdownItem>
                <DropdownItem
                    leftIcon="🦧"
                    rightIcon={<ChevronRightIcon />}
                    goToMenu="animals">
                    Animals
                </DropdownItem>

            </div>
        </CSSTransition>

        <CSSTransition
            in={activeMenu === 'settings'}
            timeout={500}
            classNames="menu-secondary"
            unmountOnExit
            onEnter={(el) => calcHeight(el)}
            onEntered={(el) => calcHeight(el)}
            onEntering={(el) => calcHeight(el)}
            onExit={(el) => calcHeight(el)}
            >

            <div className="menu p-4">
                <DropdownItem goToMenu="main" leftIcon={<ChevronLeftIcon />}>
                    <h2>My Tutorial</h2>
                </DropdownItem>
                <DropdownItem leftIcon={<LightningBoltIcon />}>HTML</DropdownItem>
                <DropdownItem leftIcon={<LightningBoltIcon />}>CSS</DropdownItem>
                <DropdownItem leftIcon={<LightningBoltIcon />}>JavaScript</DropdownItem>
                <DropdownItem leftIcon={<LightningBoltIcon />}>Awesome!</DropdownItem>
            </div>

        </CSSTransition>

        <CSSTransition
            in={activeMenu === 'animals'}
            timeout={500}
            classNames="menu-secondary"
            unmountOnExit
            onEnter={(el) => calcHeight(el)}
            onEntered={(el) => calcHeight(el)}
            onEntering={(el) => calcHeight(el)}
            onExit={(el) => calcHeight(el)}
            >

            <div className="menu p-4">

                <DropdownItem goToMenu="main" leftIcon={<ChevronLeftIcon />}>
                    <h2>Animals</h2>
                </DropdownItem>
                <DropdownItem leftIcon="🦘">Kangaroo</DropdownItem>
                <DropdownItem leftIcon="🐸">Frog</DropdownItem>
                <DropdownItem leftIcon="🦋">Horse?</DropdownItem>
                <DropdownItem leftIcon="🦔">Hedgehog</DropdownItem>
            
            </div>
         </CSSTransition>

    </div>
  );
}

function NavBarItem(props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex">
      <div className="w-[calc(4rem_*_0.8)] flex items-center justify-center">
        {/* <Link href={props.nextRouteUrl} > */}
        <div onClick={() => setOpen(!open)}>{props.icon}</div>

        {/* </Link> */}
        {open && props.children}
      </div>
    </div>
  );
}

export default AwesomeNavBar;
