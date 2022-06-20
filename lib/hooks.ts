import { auth, firestore } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDispatch } from 'react-redux';
import { usernameUpdate, userUpdate } from '../redux/actions/actions';

// Custom hook to read  auth record and user profile doc
export function useUserData() {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    // turn off realtime subscription
    let unsubscribe;

    if (user) {
      dispatch(userUpdate(user));
      debugger;
      const ref = firestore.collection('users').doc(user.uid);
      unsubscribe = ref.onSnapshot((doc) => {
        dispatch(usernameUpdate(doc.data()?.username));
        setUsername(doc.data()?.username);
      });
    } else {
      dispatch(usernameUpdate(null));
      setUsername(null);
    }

    return unsubscribe;
  }, [user]);

  return { user, username };
}