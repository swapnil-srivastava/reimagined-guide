import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useTheme } from "next-themes";
import { RootState } from "../lib/interfaces/interface";

// Top bar
function Navbar() {
  // TS infers type: (state: RootState) => boolean
  const selectUser = (state: RootState) => state.users;
  const { user, username } = useSelector(selectUser);
  const { theme, setTheme } = useTheme();

  return (
    <nav
      className="navbar md:pl-4 dark:text-blog-white dark:bg-fun-blue-500
                    bg-blog-white text-blog-black
                    drop-shadow-lg
                    z-50
                    font-medium
    "
    >
      <ul className="flex items-center justify-around md:justify-between">
        <div className="flex">
          <li className="pl-2 md:pl-0">
            <Link href="/" legacyBehavior>
              <button className="bg-hit-pink-500 text-blog-black">FEED</button>
            </Link>
          </li>
          <li>
            <button
              className="bg-hit-pink-500 text-blog-black"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </li>
        </div>

        <div className="md:text-2xl m-1">Blogging</div>

        <div className="flex items-center">
          {/* user is signed-in and has username */}
          {username && (
            <>
              <li>
                <Link href="/admin" legacyBehavior>
                  <button className="bg-hit-pink-500 text-blog-black">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </Link>
              </li>
              <li className="pr-0 md:pr-3">
                <Link href={`/${username}`} legacyBehavior>
                  {/* <img src={user?.photoURL} alt="" /> */}
                </Link>
              </li>
            </>
          )}

          {/* user is not signed-in or has not created username */}
          {!username && (
            <>
              <li>
                <Link href="/enter" legacyBehavior>
                  <button className="bg-hit-pink-500 text-blog-black">
                    Log In
                  </button>
                </Link>
              </li>
            </>
          )}
        </div>
      </ul>
    </nav>
  );
}

export default Navbar;
