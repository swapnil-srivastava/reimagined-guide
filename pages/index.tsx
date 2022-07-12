import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import toast from "react-hot-toast";

import PostFeed from "../components/PostFeed";
import Loader from "../components/Loader";
import { firestore, fromMillis, postToJSON } from "../lib/firebase";

import { useState } from "react";
import Metatags from "../components/Metatags";

// Max post to query per page
const LIMIT = 5;

export async function getServerSideProps(context) {
  const postsQuery = firestore
    .collectionGroup("posts")
    .where("published", "==", true)
    .orderBy("createdAt", "desc")
    .limit(LIMIT);

  const posts = (await postsQuery.get()).docs.map(postToJSON);

  return {
    props: { posts }, // will be passed to the page component as props
  };
}

export default function Home(props) {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);

  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];

    const cursor =
      typeof last.createdAt === "number"
        ? fromMillis(last.createdAt)
        : last.createdAt;

    const query = firestore
      .collectionGroup("posts")
      .where("published", "==", true)
      .orderBy("createdAt", "desc")
      .startAfter(cursor)
      .limit(LIMIT);

    const newPosts = (await query.get()).docs.map((doc) => doc.data());

    setPosts(posts.concat(newPosts));
    setLoading(false);

    if (newPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  };

  return (
    <main>
      <Metatags />
      <PostFeed posts={posts} />

      {!loading && !postsEnd && (
        <div className="inset-x-0 bottom-0 
                        flex justify-center 
                        bg-gradient-to-t 
                        from-white 
                        pt-32 
                        pb-8 
                        pointer-events-none 
                        dark:from-slate-900 
                        sticky 
                        -mt-52 
                        transition-opacity 
                        duration-300 
                        opacity-100">
          {/* <button className="p-2 bg-hit-pink-500 text-blog-black rounded-lg" onClick={getMorePosts}>Load More</button> */}
          <button className="relative 
                            bg-hit-pink-500
                            focus:outline-none focus:ring-2 
                            focus:ring-fun-blue-400 
                            focus:ring-offset-2 text-sm 
                            text-blog-black
                            font-semibold 
                            h-12 px-6 rounded-lg flex items-center 
                            dark:bg-hit-pink-500
                            transition-transform pointer-events-auto
                            transition-filter duration-500 hover:filter hover:brightness-125
                            " onClick={getMorePosts}>Load More</button>
        </div>
      )}

      <div className="flex items-center justify-center">
        <Loader show={loading} />
      </div>
      
      {postsEnd && <div className="flex items-center justify-center dark:text-blog-white"> You have reached the end!</div>}


    </main>
  );
}
