import styles from '../../styles/Admin.module.css';

import React, { useState } from 'react'
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { useCollection } from 'react-firebase-hooks/firestore';
import kebabCase from 'lodash.kebabcase';
import toast from 'react-hot-toast';

import AuthCheck from '../../components/AuthCheck'
import PostFeed from '../../components/PostFeed';
import { firestore, auth, serverTimestamp } from '../../lib/firebase';

interface RootState {
  counter: Object
  users: UserState,
}

interface UserState {
  user: Object,
  username: any
}

// e.g. localhost:3000/admin

function Admin() {
  return (
    <AuthCheck>
      <PostList></PostList>
      <CreateNewPost></CreateNewPost>
    </AuthCheck>
  )
}

function PostList() {
  const ref = firestore.collection('users').doc(auth.currentUser.uid).collection('posts');
  const query = ref.orderBy('createdAt');
  const [querySnapshot] = useCollection(query as any);

  const posts = querySnapshot?.docs.map((doc) => doc.data());

  return (
    <>
      <h1>Manage your Posts</h1>
      <PostFeed posts={posts} admin />
    </>
  );
  
}

function CreateNewPost() {

  const router = useRouter();
  
  // TS infers type: (state: RootState) => boolean
  const selectUser = (state: RootState) => state.users; 
  const { username } = useSelector(selectUser);
  
  const [title, setTitle] = useState('');

  // Ensure slug is URL safe
  const slug = encodeURI(kebabCase(title));

  // Validate length
  const isValid = title.length > 3 && title.length < 100;

  // Create a new post in firestore
  const createPost = async (e) => {
    e.preventDefault();
    const uid = auth.currentUser.uid;
    const ref = firestore.collection('users').doc(uid).collection('posts').doc(slug);

    // Tip: give all fields a default value here
    const data = {
      title,
      slug,
      uid,
      username,
      published: false,
      content: '# hello world!',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      heartCount: 0,
    };

    await ref.set(data);

    toast.success('Post created!')

    // Imperative navigation after doc is set
    router.push(`/admin/${slug}`);

  };

  return (
    <form onSubmit={createPost}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="My Awesome Article!"
        className={styles.input}
      />
      <p>
        <strong>Slug:</strong> {slug}
      </p>
      <button type="submit" disabled={!isValid} className="btn-green">
        Create New Post
      </button>
    </form>
  );

}

export default Admin;

