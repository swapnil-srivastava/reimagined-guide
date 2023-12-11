import React from "react";
import Link from "next/link";
import Image from "next/legacy/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesRight, faHeart, faPenToSquare, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";

import RoundButton from "./RoundButton";

export function PostFeed({
  posts,
  user = undefined,
  admin = false,
  parentFunction = () => alert("No Parent Function"),
  loading = false,
  postsEnd = false,
  enableLoadMore = false,
  approve = false,
  isSwapnil = undefined,
}) {
  return posts
    ? posts.map((post, index, array) => (
        <>
          <PostItem
            post={post}
            key={post.slug}
            admin={post && post.uid === (user && user?.id) ? true : false}
            approve={
              isSwapnil && isSwapnil?.id === process.env.NEXT_PUBLIC_SWAPNIL_ID
                ? true
                : false
            }
          />

          {index === array.length - 1 &&
            !loading &&
            !postsEnd &&
            enableLoadMore && (
              <div
                className="p-3 px-16 my-4 
                        bg-fun-blue-600
                        dark:bg-hit-pink-500 dark:text-blog-white
                        rounded-lg 
                        drop-shadow-lg
                        hover:drop-shadow-xl
                        flex items-center justify-center
                        hover:brightness-125"
              >
                <button
                  className="
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
                  onClick={() => parentFunction()}
                >
                  <div className="pr-2">Load More</div>
                  <FontAwesomeIcon icon={faAnglesRight} size={"3x"} />
                </button>
              </div>
            )}
        </>
      ))
    : "No Post";
}

function PostItem({ post, admin = false, approve = false }) {
  const wordCount = post?.content.trim().split(/\s+/g).length;
  const contentTrimmed = generateContent(post?.content);
  const titleTrimmed = generateContent(post?.title);
  const minutesToRead = (wordCount / 100 + 1).toFixed(0);
  const dateFormat = moment(post.created_at).isValid()
    ? moment(post.created_at).format("DD MMM YYYY hh:mm a")
    : moment(post.created_at?.toMillis()).format("DD MMM YYYY hh:mm a");

  function generateContent(input) {
    if (!input) return;
    if (input.length > 25) {
      return input.substring(0, 25) + "...";
    }
    return input;
  }

  return <>
    <Link href={`/${post.username}/${post.slug}`} legacyBehavior>
      <div
        className="p-3 lg:mx-0 mx-3 bg-blog-white 
         dark:bg-fun-blue-600 dark:text-blog-white rounded-lg
         drop-shadow-lg hover:drop-shadow-xl hover:brightness-125"
      >
        <div className="flex flex-col">
          <div className="flex justify-between gap-x-4">
            <div className="flex items-center shrink-0">
              <div className="flex items-center gap-x-2">
                <Link href={`/${post.username}`} legacyBehavior>
                  {post?.photo_url && post?.photo_url ? (
                    <div className="w-12 h-12 rounded-full cursor-pointer flex items-center overflow-hidden">
                      <Image
                        width={200}
                        height={200}
                        src={post.photo_url}
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
                {/* Edit Button for the article */}
                {admin && (
                  <>
                    <Link href={`/admin/${post.slug}`} >
                      <RoundButton pink={true}>
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </RoundButton>
                    </Link>
                  </>
                )}

                {/* Approve Button for the Article */}
                {approve && (
                  <>
                    <Link href={`/approve/${post.slug}`} legacyBehavior>
                      <RoundButton pink={true}>
                          <FontAwesomeIcon icon={faThumbsUp} />
                      </RoundButton>
                    </Link>
                  </>
                )}

                {/* Heart Count Number and Heart Icon for the article */}
                <RoundButton>
                  <div>{post.heartCount || 0}</div>
                  <FontAwesomeIcon icon={faHeart} />
                </RoundButton>
              </div>
            </div>
          </div>

          {/* Trimmed Title of the Blog Post */}
          <div>
            <div className="text-2xl font-semibold">
              <Link href={`/${post.username}/${post.slug}`}>
                {titleTrimmed}
              </Link>
            </div>
          </div>

          {/* Trimmed Content of the Blog Post */}
          <div className="flex justify-end">
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
  </>;
}

export default PostFeed;
