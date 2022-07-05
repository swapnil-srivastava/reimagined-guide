import React from 'react'
import Link from "next/link";
import { useSelector } from 'react-redux';

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

  return (
    <nav className='navbar dark:bg-gray-800 dark:text-blog-white'>
        <ul>
            <li>
                <Link href="/">
                    <button className='btn-logo'>FEED</button>
                </Link>
            </li>

            <span>Blogging app - Swapnil Srivastava</span>

            {/* user is signed-in and has username */}
            {username && (
                <>  
                    <li className='push-left'>
                        <Link href="/admin">
                            <button className='btn-blue'>Write Posts</button>
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
                            <button className='btn-blue'>Log In</button>
                        </Link>
                    </li>         
                </>
            )}

        </ul>
    </nav>
  )
}

export default Navbar