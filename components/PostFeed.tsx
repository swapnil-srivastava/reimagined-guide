import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PencilAltIcon, HeartIcon } from "@heroicons/react/solid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesRight } from "@fortawesome/free-solid-svg-icons"
import moment from "moment";

// Auth
import { auth } from "../lib/firebase";

export function PostFeed({ posts, admin = false, parentFunction = () => alert('No Parent Function'), loading = false, postsEnd = false, enableLoadMore = false }) {
  return posts
    ? posts.map((post, index, array) => (
      <>
        <PostItem
          post={post}
          key={post.slug}
          admin={post && post.uid === auth.currentUser?.uid ? true : false}
        />

        {index === array.length - 1 && !loading && !postsEnd && enableLoadMore &&
          <div className="p-3 px-16 my-4 
            bg-fun-blue-600
            dark:bg-hit-pink-500 dark:text-blog-white
            rounded-lg 
            drop-shadow-lg
            hover:drop-shadow-xl
            flex items-center justify-center
            lg:visible
            sm:invisible">
            <button className="
                focus:outline-none focus:ring-2 
                focus:ring-fun-blue-400 
                focus:ring-offset-2 text-sm 
                text-blog-black
                font-semibold 
                h-12 px-3 rounded-lg
                bg-hit-pink-500
                dark:bg-fun-blue-600 dark:text-blog-white
                transition-transform pointer-events-auto
                transition-filter duration-500 hover:filter hover:brightness-125
                flex items-center
                "
              onClick={() => parentFunction()}>
                <div className="pr-2">Load More</div>
                <FontAwesomeIcon
                  icon={faAnglesRight}
                  size={'2x'}
              />
            </button>
          </div>}
      </>
    ))
    : "";
}

function PostItem({ post, admin = false }) {
  const wordCount = post?.content.trim().split(/\s+/g).length;
  const contentTrimmed = generateContent(post?.content);
  const titleTrimmed = generateContent(post?.title);
  const minutesToRead = (wordCount / 100 + 1).toFixed(0);
  const dateFormat = moment(post.createdAt).isValid()
    ? moment(post.createdAt).format("DD MMM YYYY hh:mm a")
    : moment(post.createdAt?.toMillis()).format("DD MMM YYYY hh:mm a");

  function generateContent(input) {
    if (!input) return;
    if (input.length > 25) {
      return input.substring(0, 25) + "...";
    }
    return input;
  }

  return (
    <>
      <Link href={`/${post.username}/${post.slug}`}>
        <div className="p-3 my-4
                  bg-blog-white 
                  dark:bg-fun-blue-600 dark:text-blog-white
                  rounded-lg
                  drop-shadow-lg
                  hover:drop-shadow-xl">
          <div className="flex flex-col">
            <div className="flex justify-between gap-x-4">
              <div className="flex items-center shrink-0">
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
                  <div className="flex flex-col">
                    <div className="flex gap-x-2">
                      <div className="font-extralight text-base md:text-lg shrink-0">
                        {minutesToRead} min read
                      </div>
                      <div className="font-extralight text-base md:text-lg shrink-0">
                        {wordCount} words
                      </div>
                    </div>
                    <div className="font-extralight text-base md:text-lg shrink-0">
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

            {/* Trimmed Title of the Blog Post */}
            <div>
              <div className="text-2xl font-semibold">
                <Link href={`/${post.username}/${post.slug}`}>
                  <a>{titleTrimmed}</a>
                </Link>
              </div>
            </div>

            {/* Trimmed Content of the Blog Post */}
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
