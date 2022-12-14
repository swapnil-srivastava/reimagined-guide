import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PencilAltIcon, HeartIcon } from "@heroicons/react/solid";
import moment from "moment";

// Auth
import { auth } from "../lib/firebase";

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
  const contentTrimmed = generateContent(post?.content);
  const minutesToRead = (wordCount / 100 + 1).toFixed(0);
  const dateFormat = moment(post.createdAt).isValid()
    ? moment(post.createdAt).format("DD MMM YYYY hh:mm a")
    : moment(post.createdAt?.toMillis()).format("DD MMM YYYY hh:mm a");

  function generateContent(input) {
    if (!input) return;
    if (input.length > 50) {
      return input.substring(0, 50) + "...";
    }
    return input;
  }

  return (
    <>
    <Link href={`/${post.username}/${post.slug}`}>
      <div className="p-3 my-4 mx-4 
                  bg-blog-white 
                  dark:bg-fun-blue-600 dark:text-blog-white
                  rounded-lg
                  drop-shadow-lg
                  hover:drop-shadow-xl">
        <div>
          <div className="flex justify-between">
            <div className="flex items-center">
              <div className="flex items-center gap-x-2">
                <Link href={`/${post.username}`}>
                  {post?.photoURL && post?.photoURL ? (
                    <div className="w-12 h-12 rounded-full cursor-pointer flex items-center overflow-hidden">
                      <Image
                        width={200}
                        height={200}
                        src={post.photoURL}
                        alt=""
                      />
                    </div>
                  ) : (
                    <div className="text-base font-thin">{` ${post.username}`}</div>
                  )}
                </Link>
                <div className="">
                  <div className="flex gap-x-2">
                    <div className="font-extralight text-base md:text-lg">
                      {minutesToRead} min read
                    </div>
                    <div className="font-extralight text-base md:text-lg">
                      {wordCount} words
                    </div>
                  </div>
                  <div className="font-extralight text-base md:text-lg">
                    {`${dateFormat}`}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex gap-x-1">
                {admin && (
                  <>
                    <Link href={`/admin/${post.slug}`}>
                      <button className="
                          bg-hit-pink-500 text-blog-black
                          dark:text-blog-black w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-1 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125
                          ">
                        <PencilAltIcon className="h-5 w-5" />
                      </button>
                    </Link>
                  </>
                )}
                <div className="flex items-center justify-center
                        bg-fun-blue-300 text-blog-black
                        dark:text-blog-black w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-1 m-0.5 rounded-full transition-filter duration-500 hover:filter hover:brightness-125
                        ">
                  <div>{post.heartCount || 0}</div>
                  <HeartIcon className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-2xl font-semibold">
              <Link href={`/${post.username}/${post.slug}`}>
                <a>{post.title}</a>
              </Link>
            </div>
          </div>

          <div className="flex justify-between">
            <div className="text-xl font-thin">{contentTrimmed}</div>
            <div className="flex">
              {post.published ? (
                <p className="text-success self-end">Live</p>
              ) : (
                <p className="text-danger self-end">Unpublished</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
    </>
  );
}

export default PostFeed;
