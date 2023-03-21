import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { supaClient } from "../supa-client";
import { firestore } from "../lib/firebase";
import { SupashipUserInfo } from "../lib/hooks";
import debounce from "lodash.debounce";
import { now } from "moment";

interface RootState {
  counter: Object;
  users: UserState;
}

interface UserState {
  user: User;
  username: any;
  userInfo: SupashipUserInfo;
}

interface User {
  uid: String;
  photoURL: String;
  displayName: String;
}

// e.g. localhost:3000/enter
function Enter() {
  const selectUser = (state: RootState) => state.users;
  const { user, username, userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  // 1. user signed out <SignInButton />
  // 2. user signed in, but missing username <UsernameForm />
  // 3. user signed in, has username <SignOutButton />
  return (
    <main className="flex items-center justify-center">
      {profile?.id ? (
        !profile?.username ? (
          <UsernameForm />
        ) : (
          <SignOutButton />
        )
      ) : (
        <>
          <SignInButton />
        </>
      )}
    </main>
  );
}

// Sign in with Google button
function SignInButton() {
  async function signInWithGoogleSupabase() {
    const { data, error } = await supaClient.auth.signInWithOAuth({
      provider: "google",
    });
  }

  return (
    <div className="flex items-center">
      <button
        className="flex items-center bg-white rounded-lg px-4 m-2
              transition-filter duration-500 hover:filter hover:brightness-125
              border
              border-fun-blue-200
              dark:border-0
              focus:outline-none focus:ring-2 
              focus:ring-fun-blue-400 
              focus:ring-offset-2 text-sm 
              text-blog-black
              font-semibold 
              dark:text-fun-blue-500
              "
        onClick={signInWithGoogleSupabase}
      >
        <img className="h-10 w-10" src={"/google.png"} />
        <div>Sign in with Google</div>
      </button>
    </div>
  );
}

// Sign out button
function SignOutButton() {
  async function signoutSupa() {
    const { error } = await supaClient.auth.signOut();
  }
  return (
    <button
      className="bg-hit-pink-500 text-blog-black
              rounded-lg px-4 py-2 m-2
              transition-filter duration-500 hover:filter hover:brightness-125 
              focus:outline-none focus:ring-2 
              focus:ring-fun-blue-400 
              focus:ring-offset-2 text-sm
              font-semibold"
      onClick={() => signoutSupa()}
    >
      Sign Out
    </button>
  );
}

// Username form
function UsernameForm() {
  const [formValue, setFormValue] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  // TS infers type: (state: RootState) => boolean
  const selectUser = (state: RootState) => state.users;
  const { user, username, userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  const onSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supaClient
      .from("profiles")
      .update({ username: formValue })
      .eq("id", profile?.id)
      .select();
  };

  const onChange = (e) => {
    // Force form value typed in form to match correct format
    const val = e.target.value.toLowerCase();
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    // Only set form value if length is < 3 OR it passes regex
    if (val.length < 3) {
      setFormValue(val);
      setLoading(false);
      setIsValid(false);
    }

    if (re.test(val)) {
      setFormValue(val);
      setLoading(true);
      setIsValid(false);
    }
  };

  //

  useEffect(() => {
    checkUsername(formValue);
  }, [formValue]);

  // Hit the database for username match after each debounced change
  // useCallback is required for debounce to work
  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 3) {
        let { data: profiles, error } = await supaClient
          .from("profiles")
          .select("username")
          .like("username", username); // "%CaseSensitive%"
        setIsValid(profiles?.length === 0);
        setLoading(false);
      }
    }, 500),
    []
  );

  return (
    !profile?.username && (
      <section>
        <div className="flex flex-col justify-center h-screen w-screen text-blog-black dark:text-blog-white">
          <form
            onSubmit={onSubmit}
            className="self-center flex flex-col text-blog-black dark:text-blog-white 
                      font-mono text-3xl lg:text-6xl
                      px-5 py-5
          "
          >
            <label className="block">
              <span
                className="after:content-['*'] after:ml-0.5 after:text-red-500 block font-medium
            text-blog-black dark:text-blog-white"
              >
                Username
              </span>
              <input
                name="username"
                value={formValue}
                onChange={onChange}
                className="mt-1 px-3 py-2 bg-white border shadow-sm border-slate-300 
                placeholder-slate-400 focus:outline-none focus:border-sky-500 
                focus:ring-sky-500 block w-full rounded-md focus:ring-1
                text-blog-black dark:text-blog-black
                placeholder:dark:text-blog-black
                placeholder:text-blog-black
                "
                placeholder="Choose a name"
              />
            </label>
            <UsernameMessage
              username={formValue}
              isValid={isValid}
              loading={loading}
            />
            <button
              type="submit"
              className="bg-hit-pink-500 text-blog-black
              rounded-lg px-4 py-2 m-2
              transition-filter duration-500 hover:filter hover:brightness-125 
              focus:outline-none focus:ring-2 
              focus:ring-fun-blue-400 
              focus:ring-offset-2
              dark:text-blog-black"
              disabled={!isValid}
            >
              Choose Username
            </button>
          </form>
        </div>
      </section>
    )
  );
}

function UsernameMessage({ username, isValid, loading }) {
  if (loading) {
    return <p>Checking...</p>;
  } else if (isValid) {
    return <p className="text-success">{username} is available!</p>;
  } else if (username && !isValid) {
    return <p className="text-danger">That username is taken!</p>;
  } else {
    return <p></p>;
  }
}

export default Enter;
