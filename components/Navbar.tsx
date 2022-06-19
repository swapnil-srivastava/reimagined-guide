import React from 'react'
import Link from "next/link";

// Top bar
function Navbar() {

  const user = null;
  const username = null;

  return (
    <nav className='navbar'>
        <ul>
            <li>
                <Link href="/">
                    <button className='btn-logo'>FEED</button>
                </Link>
            </li>

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