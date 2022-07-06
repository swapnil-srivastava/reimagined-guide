import { firestore, auth, increment } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { DocumentSnapshot, getDoc } from "firebase/firestore";

// Allows user to heart or like a post
export default function Heart({ postRef }) {
  // Listen to heart document for currently logged in user
  const heartRef = postRef.collection('hearts').doc(auth.currentUser.uid);

  const [docRefState, setDocRefState] = useState<DocumentSnapshot | undefined>()

  useEffect(() => {
    heartRefCheck();
  }, []);

  const heartRefCheck = async () => {
    const docRef = await getDoc(heartRef);
    setDocRefState(docRef);
  }
  

  // Create a user-to-post relationship
  const addHeart = async () => {

    const uid = auth.currentUser.uid;
    const batch = firestore.batch();

    batch.update(postRef, { heartCount: increment(1) });
    batch.set(heartRef, { uid });

    await batch.commit();

    // reading the ref and updating the state
    heartRefCheck();
  };

  // Remove a user-to-post relationship
  const removeHeart = async () => {

    const batch = firestore.batch();

    batch.update(postRef, { heartCount: increment(-1) });
    batch.delete(heartRef);

    await batch.commit();

    // reading the ref and updating the state
    heartRefCheck();
  };

  return docRefState?.exists() ? (
      <button className="bg-hit-pink-500 text-blog-black" onClick={removeHeart}>
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-1 hover:stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    ) : (
      <button className="bg-hit-pink-500 text-blog-black" onClick={addHeart}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-1 hover:stroke-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      </button>
    );
}