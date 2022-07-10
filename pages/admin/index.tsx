import styles from "../../styles/Admin.module.css";

import React, { useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useCollection } from "react-firebase-hooks/firestore";
import kebabCase from "lodash.kebabcase";
import toast from "react-hot-toast";

import AuthCheck from "../../components/AuthCheck";
import PostFeed from "../../components/PostFeed";
import { firestore, auth, serverTimestamp } from "../../lib/firebase";

interface RootState {
  counter: Object;
  users: UserState;
}

interface UserState {
  user: Object;
  username: any;
}

// e.g. localhost:3000/admin

function Admin() {
  return (
    <AuthCheck>
      <CreateNewPost></CreateNewPost>
      <PostList></PostList>
    </AuthCheck>
  );
}

function PostList() {
  const ref = firestore
    .collection("users")
    .doc(auth.currentUser.uid)
    .collection("posts");
  const query = ref.orderBy("createdAt");
  const [querySnapshot] = useCollection(query as any);

  const posts = querySnapshot?.docs.map((doc) => doc.data());

  return (
    <>
      <div className="flex items-center justify-center">
        <h1 className="dark:text-blog-white">Manage your Posts</h1>
      </div>
      <PostFeed posts={posts} admin />
    </>
  );
}

function CreateNewPost() {
  const router = useRouter();

  // TS infers type: (state: RootState) => boolean
  const selectUser = (state: RootState) => state.users;
  const { username } = useSelector(selectUser);

  const [title, setTitle] = useState("");

  // Ensure slug is URL safe
  const slug = encodeURI(kebabCase(title));

  // Validate length
  const isValid = title.length > 3 && title.length < 100;

  // Create a new post in firestore
  const createPost = async (e) => {
    e.preventDefault();
    const uid = auth.currentUser.uid;
    const ref = firestore
      .collection("users")
      .doc(uid)
      .collection("posts")
      .doc(slug);

    // Tip: give all fields a default value here
    const data = {
      title,
      slug,
      uid,
      username,
      published: false,
      content: "# hello world!",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      heartCount: 0, 
    };

    await ref.set(data);

    toast.success("Post created!");

    // Imperative navigation after doc is set
    router.push(`/admin/${slug}`);
  };

  return (
    <form onSubmit={createPost}>
      <div className="flex items-center justify-center text-3xl mb-5 dark:text-blog-white">Create a new post</div>
      <div className={styles.adminAddArticle}>
        <div className={styles.inputAndLabel}>
          <label className={styles.inputLabel} htmlFor="title">
            New Article Title *
          </label>
          <span className="sr-only">Add a new article title and create the post</span>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Your Next Big Article Title!"
            className={styles.input}
          />
        </div>

        <p className="p-1 m-1 dark:text-blog-white text-sm md:text-lg">Article URL : {slug || `your-next-big-article-title`}</p>


        <button type="submit" disabled={!isValid} className={styles.btnAdmin}>
          Create
        </button>
      </div>
    </form>
  );
}

export default Admin;
