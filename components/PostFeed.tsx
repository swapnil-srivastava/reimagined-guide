import React from "react";
import Link from "next/link";
import Image from "next/legacy/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesRight, faHeart, faPenToSquare, faThumbsUp, faEye } from "@fortawesome/free-solid-svg-icons";
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
      <div className="group bg-white dark:bg-fun-blue-600 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-fun-blue-500 hover:border-gray-200 dark:hover:border-fun-blue-400">
        
        <div className="p-4">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-3">
            <Link href={`/${post.username}`} legacyBehavior>
              <div className="flex items-center gap-2 cursor-pointer">
                {post?.photo_url ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-gray-200 dark:ring-fun-blue-400">
                    <Image
                      width={32}
                      height={32}
                      src={post.photo_url}
                      alt={`${post.username} profile`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-persian-blue-400 to-caribbean-green-400 flex items-center justify-center text-white font-medium text-sm">
                    {post.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-white hover:text-fun-blue-500 dark:hover:text-caribbean-green-300 transition-colors">
                    {post.username}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {moment(post.created_at).format("MMM DD")} · {minutesToRead} min read
                  </span>
                </div>
              </div>
            </Link>

            {/* Compact Status Badge */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                post.published 
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  post.published ? 'bg-green-500' : 'bg-orange-500'
                }`}></div>
                {post.published ? 'Live' : 'Draft'}
              </span>

              {/* Action Buttons - Creative Circular Design */}
              {(admin || approve) && (
                <div className="flex items-center gap-2">
                  {admin && (
                    <Link href={`/admin/${post.slug}`}>
                      <div className="w-8 h-8 bg-fun-blue-300 dark:bg-fun-blue-400 dark:text-black p-0.5 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:filter hover:brightness-125 group">
                        {post.published ? (
                          <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5 text-gray-700 dark:text-black group-hover:scale-110 transition-transform" />
                        ) : (
                          <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5 text-gray-700 dark:text-black group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                    </Link>
                  )}
                  {approve && (
                    <Link href={`/approve/${post.slug}`} legacyBehavior>
                      <div className="w-8 h-8 bg-caribbean-green-300 dark:bg-caribbean-green-400 dark:text-black p-0.5 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:filter hover:brightness-125 group">
                        {post.published ? (
                          <FontAwesomeIcon icon={faThumbsUp} className="h-3.5 w-3.5 text-green-700 dark:text-black group-hover:scale-110 transition-transform" />
                        ) : (
                          <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5 text-green-700 dark:text-black group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <Link href={`/${post.username}/${post.slug}`} legacyBehavior>
            <div className="cursor-pointer">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-fun-blue-500 dark:group-hover:text-caribbean-green-300 transition-colors duration-200 line-clamp-2 leading-tight">
                {post.title}
              </h2>
              
              {/* Content Preview - Compact */}
              <div 
                className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-3"
                dangerouslySetInnerHTML={{ __html: post?.content.substring(0, 120) + "..." }}
              />
            </div>
          </Link>

          {/* Footer - Compact */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-fun-blue-500">
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>{wordCount} words</span>
              <span>·</span>
              <span>{moment(post.created_at).fromNow()}</span>
            </div>
            
            {/* Heart Count - Inline */}
            {(post.heartCount || post.heart_count) && (post.heartCount > 0 || post.heart_count > 0) && (
              <div className="flex items-center gap-1.5 text-red-500">
                <FontAwesomeIcon icon={faHeart} className="h-3.5 w-3.5" />
                <span className="text-sm font-medium">
                  {post.heartCount || post.heart_count || 0}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </>;
}export default PostFeed;
