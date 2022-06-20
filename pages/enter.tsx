import React from 'react';
import { useSelector } from 'react-redux';
import { auth, googleAuthProvider } from '../lib/firebase';

// e.g. localhost:3000/enter
function Enter() {
  const { user, username } = useSelector(state => state.user);

  // 1. user signed out <SignInButton />
  // 2. user signed in, but missing username <UsernameForm />
  // 3. user signed in, has username <SignOutButton />
  return (
    <>
    <SignInButton />
    <SignOutButton /> 
    <main>
      {user ? 
        !username ? <UsernameForm /> : <SignOutButton /> 
        : 
        <SignInButton />
      }
    </main>
    </>
  );
}

// Sign in with Google button
function SignInButton() {
  const signInWithGoogle = async () => {
    await auth.signInWithPopup(googleAuthProvider);
  };

  return (
    <button className="btn-google" onClick={signInWithGoogle}>
      <img src={'/google.png'} /> Sign in with Google
    </button>
  );
}

// Sign out button
function SignOutButton() {
  function signout() {
    
    auth.signOut();
    console.log('====================================');
    console.log("clicked");
    console.log('====================================');

  }

  return <button onClick={() => signout()}>Sign Out</button>;
}

function UsernameForm() {
  return null;
}

export default Enter