import React from "react";
import Link from "next/link";
import { auth } from "../lib/firebase";
import { PencilAltIcon, HeartIcon } from "@heroicons/react/solid";

export function PostFeed({ posts, admin = false }) {
  return posts
    ? posts.map((post) => (
        <PostItem
          post={post}
          key={post.slug}
          admin={post && post.uid === auth.currentUser?.uid ? true : false}
        />
      ))
    : "";
}

function PostItem({ post, admin = false }) {
  const wordCount = post?.content.trim().split(/\s+/g).length;
  const contentTrimmed = generateMetaDescription(post?.content);
  const minutesToRead = (wordCount / 100 + 1).toFixed(0);

  function generateMetaDescription(input) {
    if (!input) return;
    if (input.length > 50) {
      return input.substring(0, 50) + "...";
    }
    return input;
  }

  return (
    <>
      <div
        className="
            p-3 my-4 mx-4 
            bg-blog-white 
            dark:bg-fun-blue-600 dark:text-blog-white
            rounded-lg
            drop-shadow-lg
            hover:drop-shadow-xl
            flex
            flex-column
            justify-between
            "
      >
        <div className="basis-2/3">
          <Link href={`/${post.username}`}>
            <a>
              <strong>By @{post.username}</strong>
            </a>
          </Link>

          <Link href={`/${post.username}/${post.slug}`}>
            <h2>
              <a>{post.title}</a>
            </h2>
          </Link>

          <div>{contentTrimmed}</div>

          <footer>
            <span>{wordCount} words </span>
            <span>{minutesToRead} min read</span>
          </footer>
        </div>

        <div className="flex flex-col justify-between items-end basis-1/3">
          {/* If admin view, show extra controls for user */}
          <div className="flex">
            {admin && (
              <>
                <Link href={`/admin/${post.slug}`}>
                  <button
                    className="
                    bg-hit-pink-500 text-blog-black
                    dark:text-blog-black w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-1 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125
                    "
                  >
                    <PencilAltIcon className="h-5 w-5"/>
                  </button>
                </Link>
              </>
            )}
            <div
              className="flex items-center justify-center
          bg-fun-blue-300 text-blog-black
          dark:text-blog-black w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-1 m-0.5 rounded-full transition-filter duration-500 hover:filter hover:brightness-125
          "
            >
              <div>{post.heartCount || 0}</div>
              <HeartIcon className="h-5 w-5"/>
            </div>
          </div>

          {post.published ? (
            <p className="text-success self-end">Live</p>
          ) : (
            <p className="text-danger self-end">Unpublished</p>
          )}
        </div>
      </div>
    </>
  );
}

export default PostFeed;
