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
  faShoppingCart,
  faBasketShopping,
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
import { FormattedMessage, useIntl } from "react-intl";

function AwesomeNavBar() {
  // TS infers type: (state: RootState) => boolean
  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  const { theme, setTheme } = useTheme();
  const intl = useIntl();

  const { locales, asPath, locale: nextLocale } = useRouter();

  const [ currentLocale, setCurrentLocale] = useState(nextLocale);
  const [logoSrc, setLogoSrc] = useState("/swapnil-odyssey-4.svg");

  // Randomizer function for logo selection based on theme
  const getRandomLogo = (currentTheme: string) => {
    const lightModeLogos = [
      "/swapnil-odyssey-4.svg", // with blue
      "/swapnil-odyssey-6.svg", // with blue
      "/swapnil-odyssey-1.svg",
      "/swapnil-odyssey-2.svg",
      "/swapnil-odyssey-3.svg",
      "/swapnil-odyssey-5.svg",
      "/swapnil-odyssey-7.svg"
    ];
    
    const darkModeLogos = [
      "/swapnil-odyssey-8.svg", // with white
      "/swapnil-odyssey-9.svg",
      "/swapnil-odyssey-1.svg",
      "/swapnil-odyssey-2.svg",
      "/swapnil-odyssey-3.svg",
      "/swapnil-odyssey-5.svg",
      "/swapnil-odyssey-7.svg"
    ];

    const logos = currentTheme === "dark" ? darkModeLogos : lightModeLogos;
    const randomIndex = Math.floor(Math.random() * logos.length);
    return logos[randomIndex];
  };

  // Update logo when theme changes
  useEffect(() => {
    if (theme) {
      setLogoSrc(getRandomLogo(theme));
    }
  }, [theme]);

  // Initialize logo on component mount
  useEffect(() => {
    setLogoSrc(getRandomLogo(theme || "light"));
  }, []);

  const handleChange = (event: SelectChangeEvent) => {
    setCurrentLocale(event.target.value as string);
  };

  return (
    <NavBar logoSrc={logoSrc}>
      <NavBarItem nextrouteurl>
        <div className="h-full flex items-center px-1">
          <FormControl size="small" sx={{ minWidth: 80 }}>
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
              size="small"
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 200,
                    width: 100,
                  },
                },
              }}
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
        </div>
      </NavBarItem>

      <NavBarItem
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        icon={
          theme === "dark" ? (
            <BasicTooltip title={intl.formatMessage({
              id: 'nav-dark-mode-tooltip',
              description: 'Dark Mode',
              defaultMessage: 'Dark Mode'
            })} placement="bottom">
              <RoundButton>
                <FontAwesomeIcon icon={faMoon} size="lg" />
              </RoundButton>
            </BasicTooltip>
          ) : (
            <BasicTooltip title={intl.formatMessage({
              id: 'nav-light-mode-tooltip',
              description: 'Light Mode',
              defaultMessage: 'Light Mode'
            })} placement="bottom">
              <RoundButton>
                  <FontAwesomeIcon icon={faSun} size="lg" />
              </RoundButton>
            </BasicTooltip>
          )
        }
      />

      <NavBarItem nextrouteurl>
        <Link href="/technology">
          <div className="w-[calc(2.5rem)] h-[calc(2.5rem)] flex items-center justify-center cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <BasicTooltip title={intl.formatMessage({
              id: 'nav-tech-stack-tooltip',
              description: 'Tech Stack',
              defaultMessage: 'Tech Stack'
            })} placement="bottom">
              <RoundButton>
                <FontAwesomeIcon icon={faBolt} size="lg" />
              </RoundButton>
            </BasicTooltip>
          </div>
        </Link>
      </NavBarItem>

      {/* user is not signed-in or has not created username */}
      {!profile?.username && (
        <NavBarItem nextrouteurl>
          <Link href="/enter">
            <div className="w-[calc(2.5rem)] h-[calc(2.5rem)] flex items-center justify-center cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <BasicTooltip title={intl.formatMessage({
                id: 'nav-login-tooltip',
                description: 'Login',
                defaultMessage: 'Login'
              })} placement="bottom">
                <RoundButton>
                  <FontAwesomeIcon icon={faArrowRightToBracket} size="lg" />
                </RoundButton>
              </BasicTooltip>
            </div>
          </Link>
        </NavBarItem>
      )}

      {/* user is signed-in and has username */}
      {profile?.username && (
        <>
            <NavBarItem nextrouteurl>
              <Link href="/admin">
                <div className="w-[calc(2.5rem)] h-[calc(2.5rem)] flex items-center justify-center cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <BasicTooltip title={intl.formatMessage({
                    id: 'nav-write-post-tooltip',
                    description: 'Write a post',
                    defaultMessage: 'Write a post'
                  })} placement="bottom">
                    <RoundButton>
                      <FontAwesomeIcon icon={faPencil} size="lg" />
                    </RoundButton>
                  </BasicTooltip>
                </div>
              </Link>
            </NavBarItem>
          {/* user condition is ther because image src url is missing when clicking on sign out */}
          {profile?.username && (
            <NavBarItem nextrouteurl>
              <BasicTooltip title={profile?.full_name} placement="bottom">
                <div className="w-[calc(2.5rem)] h-[calc(2.5rem)] rounded-full cursor-pointer flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  <Link href={`/${profile?.username}`} legacyBehavior>
                    {profile?.avatar_url ? (
                      <Image
                        width={32}
                        height={32}
                        src={profile.avatar_url}
                        alt=""
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {profile?.username?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
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

interface NavBarProps {
  children: React.ReactNode;
  logoSrc: string;
}

function NavBar({ children, logoSrc }: NavBarProps) {
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
            items-center
          "
    >
      {/* Dynamic logo based on theme with randomizer */}
      <div className="basis-1/2 md:basis-1/3 flex items-center md:text-2xl m-1">
        <Link href="/" legacyBehavior>
          <Image
            width={75}
            height={75}
            src={logoSrc}
            alt="Swapnil's Odyssey"
            className="cursor-pointer transition-opacity duration-300 hover:opacity-80"
          />
        </Link>
      </div>
      <ul className="w-full h-full flex justify-end items-center">
        {children}
      </ul>
    </nav>
  );
}

function DropdownMenu({ closeDropdown }: { closeDropdown?: () => void }) {
  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;
  const router = useRouter();

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
      <div
        className="flex h-12 p-2 rounded-lg items-center 
      transition-colors duration-300 hover:bg-fun-blue-400 gap-x-1 cursor-pointer"
        onClick={() => {
          if (props.goToMenu) {
            setActiveMenu(props.goToMenu);
          } else if (props.onClick) {
            props.onClick();
            closeDropdown?.();
          }
        }}
      >
        {props.leftIcon && (
          <span className="w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-fun-blue-400">
            {props.leftIcon}
          </span>
        )}

        {props.children}

        {props.rightIcon && (
          <span className="ml-auto w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-fun-blue-400">
            {props.rightIcon}
          </span>
        )}
      </div>
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
            <DropdownItem
              onClick={() => router.push(`/${profile?.username}`)}
            >
              <div className="flex items-center gap-x-1">
                <div className="w-9 h-9 rounded-full cursor-pointer flex items-center justify-center overflow-hidden bg-gray-200">
                  {profile?.avatar_url ? (
                    <Image
                      width={200}
                      height={200}
                      src={profile.avatar_url}
                      alt={profile?.full_name || "Profile"}
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-blue rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {profile?.username?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <FormattedMessage
                  id="nav-bar-my-profile"
                  description="My Profile"
                  defaultMessage="My Profile"
                />
              </div>
            </DropdownItem>
          )}

          <DropdownItem
            leftIcon={<FontAwesomeIcon icon={faArrowRightToBracket} size="lg" />}
            onClick={() => router.push('/enter')}
          >
            {profile?.id && profile?.id ? 
              <FormattedMessage
                id="nav-bar-sign-out-text"
                description="Sign Out"
                defaultMessage="Sign Out"
              /> : <FormattedMessage
                id="nav-bar-login-text"
                description="Login"
                defaultMessage="Login"
              />}
          </DropdownItem>

          <DropdownItem
            leftIcon={<FontAwesomeIcon icon={faBasketShopping} size="lg" />}
            onClick={() => router.push('/products')}
          >
            <FormattedMessage
              id="nav-bar-products-text"
              description="Products"
              defaultMessage="Products"
            />
          </DropdownItem>

          <DropdownItem
            leftIcon={<FontAwesomeIcon icon={faShoppingCart} size="lg" />}
            onClick={() => router.push('/cart')}
          >
            <FormattedMessage
              id="nav-bar-cart-text"
              description="Cart"
              defaultMessage="Cart"
            />
          </DropdownItem>

          {/* <DropdownItem
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
            <FormattedMessage
                id="nav-bar-setting-text"
                description="Settings" // Description should be a string literal
                defaultMessage="Setting" // Message should be a string literal
                />
          </DropdownItem> */}

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
            leftIcon={<FontAwesomeIcon icon={faChevronLeft} size="lg" />}
          >
            <h2>
              <FormattedMessage
                id="navbar-my-tutorial"
                description="My Tutorial"
                defaultMessage="My Tutorial"
              />
            </h2>
          </DropdownItem>
          <DropdownItem
            leftIcon={<FontAwesomeIcon icon={faBolt} size="lg" />}
          >
            HTML
          </DropdownItem>
          <DropdownItem
            leftIcon={<FontAwesomeIcon icon={faBolt} size="lg" />}
          >
            CSS
          </DropdownItem>
          <DropdownItem
            leftIcon={<FontAwesomeIcon icon={faBolt} size="lg" />}
          >
            JavaScript
          </DropdownItem>
          <DropdownItem
            leftIcon={<FontAwesomeIcon icon={faBolt} size="lg" />}
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
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const closeDropdown = () => setOpen(false);

  return (
    <li className="flex items-center h-full" ref={dropdownRef}>
      <div
        className="h-full flex items-center justify-center px-1"
        {...props}
      >
        {props.nextrouteurl && props.children}
        {!props.nextrouteurl && (
          <div
            className="w-[calc(2.5rem)] h-[calc(2.5rem)] flex items-center justify-center cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setOpen(!open)}
          >
            {props.icon}
          </div>
        )}
        {open && React.isValidElement(props.children) 
          ? React.cloneElement(props.children, { closeDropdown })
          : open && props.children
        }
      </div>
    </li>
  );
}

export default AwesomeNavBar;
