import React from "react";
import Link from "next/link";
import Image from "next/legacy/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesRight, faHeart, faPenToSquare, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { FormattedMessage } from "react-intl";

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
                  className=" focus:outline-none focus:ring-2 focus:ring-fun-blue-400 
                focus:ring-offset-2 text-sm text-blog-black font-semibold 
                h-12 px-3 rounded-lg bg-hit-pink-500
                dark:bg-fun-blue-600 dark:text-blog-white
                transition-transform pointer-events-auto
                transition-filter duration-500 hover:filter hover:brightness-125
                flex items-center
                "
                  onClick={() => parentFunction()}
                >
                   <FormattedMessage
                    id="load_more_button"
                    description="Load More" // Description should be a string literal
                    defaultMessage="Load More" // Message should be a string literal
                  />
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
    <div className="px-4 sm:px-0">
      <div className="group relative bg-white dark:bg-fun-blue-600 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-fun-blue-500 hover:border-persian-blue-200 dark:hover:border-caribbean-green-400">
      
        <div className="p-6">
          {/* Header with Status Badge */}
          <div className="flex items-start justify-between mb-4">
            <Link href={`/${post.username}`} legacyBehavior>
              <div className="flex items-center gap-3 cursor-pointer group-hover:scale-105 transition-transform duration-200">
                {post?.photo_url ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-fun-blue-400 ring-offset-2 transition-all duration-200 hover:ring-persian-blue-400 dark:hover:ring-caribbean-green-400">
                  <Image
                    width={200}
                    height={200}
                    src={post.photo_url}
                    alt={`${post.username} profile`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-persian-blue-400 to-caribbean-green-400 flex items-center justify-center text-white font-bold text-lg ring-2 ring-gray-200 ring-offset-2">
                  {post.username?.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className="flex flex-col">
                <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-persian-blue-600 dark:group-hover:text-caribbean-green-300 transition-colors">
                  {post.username}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {dateFormat}
                </p>
              </div>
            </div>
          </Link>

          {/* Right Side: Status Badge and Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
              post.published 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                post.published ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              {post.published ? (
                <FormattedMessage id="card_live" description="Card Live" defaultMessage="Live" />
              ) : (
                <FormattedMessage id="card_unpublished" description="Card Unpublished" defaultMessage="Unpublished" />
              )}
            </span>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
            {admin && (
              <Link href={`/admin/${post.slug}`}>
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-fun-blue-700 dark:hover:bg-fun-blue-800 text-gray-600 dark:text-gray-300 transition-all duration-200 hover:scale-110">
                  <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" />
                </button>
              </Link>
            )}

            {approve && (
              <Link href={`/approve/${post.slug}`} legacyBehavior>
                <button className="p-2 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/40 text-green-600 dark:text-green-400 transition-all duration-200 hover:scale-110">
                  <FontAwesomeIcon icon={faThumbsUp} className="h-4 w-4" />
                </button>
              </Link>
            )}
            </div>
          </div>
        </div>

        {/* Title and Content */}
        <Link href={`/${post.username}/${post.slug}`} legacyBehavior>
          <div className="cursor-pointer">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-persian-blue-600 dark:group-hover:text-caribbean-green-300 transition-colors duration-200 line-clamp-2">
              {post.title}
            </h2>
            
            {/* Post Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-persian-blue-400"></div>
                <span>{minutesToRead} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-caribbean-green-400"></div>
                <span>{wordCount} words</span>
              </div>
            </div>

            {/* Content Preview */}
            <div 
              className="text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post?.content.substring(0, 150) + "..." }}
            />
          </div>
        </Link>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 dark:border-fun-blue-500">
          <Link href={`/${post.username}/${post.slug}`} legacyBehavior>
            <button className="inline-flex items-center gap-2 text-sm font-medium text-persian-blue-600 dark:text-caribbean-green-400 hover:text-persian-blue-700 dark:hover:text-caribbean-green-300 transition-colors">
              Read more
              <FontAwesomeIcon icon={faAnglesRight} className="h-3 w-3" />
            </button>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="hidden sm:inline">Published</span>
              <span>{moment(post.created_at).fromNow()}</span>
            </div>
            
            {/* Heart Count - Bottom Right using Flex */}
            {(post.heartCount || post.heart_count) && (post.heartCount > 0 || post.heart_count > 0) && (
              <div className="flex items-center gap-2 bg-white dark:bg-fun-blue-700 px-3 py-2 rounded-full shadow-lg border border-gray-200 dark:border-fun-blue-500 transition-all duration-200 hover:scale-105">
                <FontAwesomeIcon 
                  icon={faHeart} 
                  className="h-4 w-4 text-red-500 animate-pulse" 
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {post.heartCount || post.heart_count || 0}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  </>;
}

export default PostFeed;
