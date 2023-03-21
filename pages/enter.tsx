import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { supaClient } from "../supa-client";
import { firestore } from "../lib/firebase";
import { SupashipUserInfo } from "../lib/hooks";
import debounce from "lodash.debounce";

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

    // // Create refs for both documents
    // const userDoc = firestore.doc(`users/${user.uid}`);
    // const usernameDoc = firestore.doc(`usernames/${formValue}`);
    // // Commit both docs together as a batch write.
    // const batch = firestore.batch();
    // batch.set(userDoc, {
    //   username: formValue,
    //   photoURL: user.photoURL,
    //   displayName: user.displayName,
    // });
    // batch.set(usernameDoc, { uid: user.uid });
    // await batch.commit();

    const { data, error } = await supaClient
      .from("profiles")
      .update({ username: formValue })
      .eq("id", profile?.id);

    console.log("updated ==> onsubmit", data);
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
        // .ilike("username", "%CaseInsensitive%") // "%CaseInsensitive%"
        // .eq("username", "Equal to") // "Equal to"

        console.log("profiles ===>", profiles, error);
        setIsValid(profiles?.length === 0);
        setLoading(false);
      }
    }, 500),
    []
  );

  return (
    !profile?.username && (
      <section>
        <h3>Choose Username</h3>
        <form onSubmit={onSubmit}>
          <input
            name="username"
            placeholder="myname"
            value={formValue}
            onChange={onChange}
          />
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
              focus:ring-offset-2 text-sm
              font-semibold"
            disabled={!isValid}
          >
            Choose Username
          </button>

          <h3>Debug State</h3>
          <div>
            Username: {formValue}
            <br />
            Loading: {loading.toString()}
            <br />
            Username Valid: {isValid.toString()}
          </div>
        </form>
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
