import { firestore, auth, increment } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { getDoc } from "firebase/firestore";

// Allows user to heart or like a post
export default function Heart({ postRef }) {
  // Listen to heart document for currently logged in user
  const heartRef = postRef.collection('hearts').doc(auth.currentUser.uid);

  const [docRefState, setDocRefState] = useState()

  useEffect(() => {
    const addHeart = async () => {
      const docRef = await getDoc(heartRef);

      setDocRefState(docRef);

      if (docRef.exists()) {
        console.log("use Effect Document data:", docRef.data());
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }
    addHeart();
  }, [])
  

  // Create a user-to-post relationship
  const addHeart = async () => {

    const uid = auth.currentUser.uid;
    const batch = firestore.batch();

    batch.update(postRef, { heartCount: increment(1) });
    batch.set(heartRef, { uid });

    await batch.commit();

    // reading the ref and updating the state
    const docRef = await getDoc(heartRef);
    setDocRefState(docRef);
  };

  // Remove a user-to-post relationship
  const removeHeart = async () => {

    const batch = firestore.batch();

    batch.update(postRef, { heartCount: increment(-1) });
    batch.delete(heartRef);

    await batch.commit();

    // reading the ref and updating the state
    const docRef = await getDoc(heartRef);
    setDocRefState(docRef);
  };

  return docRef?.exists() ? (
      <button onClick={removeHeart}>💔 Unheart</button>
    ) : (
      <button onClick={addHeart}>💗 Heart</button>
    );
}