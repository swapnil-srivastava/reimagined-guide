import { auth, firestore } from "../lib/firebase";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { supaClient } from "../supa-client";

// Custom hook to read  auth record and user profile doc
export function useUserData() {
  const [user] = useAuthState(auth as any);
  const [username, setUsername] = useState(null);
  // const dispatch = useDispatch();

  useEffect(() => {
    // turn off realtime subscription
    let unsubscribe;

    supaClient.auth.getSession().then(({ data: { session } }) => {
      // setUserInfo({ ...userInfo, session });
      console.log("session getSession hook.ts", session);
      supaClient.auth.onAuthStateChange((_event, session) => {
        console.log("session onAuthStateChange", session);
        // setUserInfo({ session, profile: null });
      });
    });

    if (user) {
      const ref = firestore.collection("users").doc(user.uid);
      unsubscribe = ref.onSnapshot((doc) => {
        setUsername(doc.data()?.username);
      });
    } else {
      setUsername(null);
    }

    return unsubscribe;
  }, [user]);

  return { user, username };
}
