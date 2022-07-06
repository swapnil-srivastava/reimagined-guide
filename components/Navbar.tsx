import React from 'react'
import Link from "next/link";
import { useSelector } from 'react-redux';
import { useTheme } from 'next-themes'

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
}

// Top bar
function Navbar() {

  // TS infers type: (state: RootState) => boolean
  const selectUser = (state: RootState) => state.users; 
  const { user, username } = useSelector(selectUser);
  const {theme, setTheme} = useTheme();

  return (
    <nav className='navbar dark:text-blog-white dark:bg-fun-blue-500'>
        <ul>
            <li>
                <Link href="/">
                    <button className='bg-hit-pink-500 text-blog-black'>FEED</button>
                </Link>
            </li>


            <button  className="bg-hit-pink-500 text-blog-black" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg> 
                    : 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                }
            </button>

            <span className='md:text-2xl'>Blogging</span>

            {/* user is signed-in and has username */}
            {username && (
                <>  
                    <li className='push-left'>
                        <Link href="/admin">
                            <button className='bg-hit-pink-500 text-blog-black'>Write Posts</button>
                        </Link>
                    </li>
                    <li>
                        <Link href={`/${username}`}>
                            <img src={user?.photoURL} alt="" />
                        </Link>
                    </li>
                </>
            )}



            {/* user is not signed-in or has not created username */}
            {!username && (
                <>
                    <li>
                        <Link href="/enter">
                            <button className='bg-hit-pink-500 text-blog-black'>Log In</button>
                        </Link>
                    </li>         
                </>
            )}



        </ul>
    </nav>
  )
}

export default Navbar