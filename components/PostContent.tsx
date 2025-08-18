import Link from "next/link";
import { FormattedMessage, useIntl } from 'react-intl';
import Image from "next/legacy/image";
import * as postmark from "postmark";
import { useSelector } from "react-redux";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faFacebook,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faEllipsis, faHeart, faPenToSquare, faThumbsUp, faCopy, faGlobe, faRocket } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

// React Components
import HeartButton from "./HeartButton";
import BasicTooltip from "./Tooltip";
import AuthCheck from "./AuthCheck";
import Video from "./Video";
import AudioPlayer from "./AudioPlayer";

// Interface
import { RootState } from "../lib/interfaces/interface";
import { POST } from "../database.types";

// Supabase
import { supaClient } from "../supa-client";

// Email Service
import { sendEmail } from "../services/email.service";

// UI component for main post content
export default function PostContent({
  post,
  approve = false,
  audioUrl = "",
}: {
  post: POST;
  approve?: boolean;
  audioUrl?: string;
}) {
  const intl = useIntl();
  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  const wordCount = post?.content.trim().split(/\s+/g).length;
  const minutesToRead = (wordCount / 100 + 1).toFixed(0);
  const dateFormat = moment(post?.created_at).isValid()
    ? moment(post?.created_at).format("MMM DD")
    : "";

  const approvePost = async (post: POST) => {
    const {
      data: { user },
    } = await supaClient.auth.getUser();

    if (user?.id === process.env.NEXT_PUBLIC_SWAPNIL_ID) {
      const { data, error } = await supaClient
        .from("posts")
        .update({ approved: true })
        .eq("slug", post?.slug);

      toast.success(intl.formatMessage({
        id: "postcontent-post-approved",
        description: "Post approved successfully!",
        defaultMessage: "Post approved successfully!"
      }));

      const articleURL = `https://swapnilsrivastava.eu/${post?.username}/${post?.slug}`;

      const emailMessage: Partial<postmark.Message> = {
        To: "contact@swapnilsrivastava.eu",
        Subject: "Article Approved",
        HtmlBody: `<strong>Hello</strong> Swapnil Srivastava, new article is approved on your website and visible, navigate to ${articleURL}`,
      };

      sendEmail(emailMessage);

      toast.success(intl.formatMessage({
        id: "postcontent-email-confirmation-sent",
        description: "Email confirmation sent!",
        defaultMessage: "Email confirmation sent!"
      }));
    }
  };

  return <>
    <div className="relative p-3 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-500 dark:text-blog-white rounded-lg drop-shadow-lg hover:drop-shadow-xl dark:hover:brightness-125">
      {/* Floating Engagement Sidebar - Top left side of card */}
      {post?.heart_count && post.heart_count > 0 && (
        <div className="absolute -left-16 top-20 z-50 hidden lg:flex flex-col items-center bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-600">
          <div className="flex flex-col items-center gap-2">
            <FontAwesomeIcon 
              icon={faHeart} 
              className="h-5 w-5 text-red-500 animate-pulse" 
            />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {post.heart_count}
            </span>
          </div>
        </div>
      )}
      {/* Post Action Dashboard SECTION */}
      <div className="relative mb-6 p-4 bg-gradient-to-br from-persian-blue-50 to-caribbean-green-50 dark:from-fun-blue-600 dark:to-dark-blue-600 rounded-xl border border-persian-blue-100 dark:border-fun-blue-400 shadow-sm">
        {/* Status Badge */}
        <div className="absolute -top-2 -right-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
            post.published 
              ? 'bg-caribbean-green-500 text-white ring-2 ring-caribbean-green-100' 
              : 'bg-hit-pink-500 text-white ring-2 ring-hit-pink-100'
          }`}>
            {post.published ? (
              <FormattedMessage
                id="postcontent-published-status"
                description="● Published"
                defaultMessage="● Published"
              />
            ) : (
              <FormattedMessage
                id="postcontent-draft-status"
                description="● Draft"
                defaultMessage="● Draft"
              />
            )}
          </span>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
          <button 
            className="group relative overflow-hidden bg-slate-500 hover:bg-slate-600 text-white rounded p-1.5 transition-all duration-300 transform hover:scale-105 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            aria-label={intl.formatMessage({
              id: "postcontent-edit-post-aria",
              description: "Edit post",
              defaultMessage: "Edit post"
            })}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-400 to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center space-x-1">
              <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3" />
              <span className="text-[10px] font-medium leading-tight">Edit</span>
            </div>
          </button>

          <button 
            className="group relative overflow-hidden bg-orange-500 hover:bg-orange-600 text-white rounded p-1.5 transition-all duration-300 transform hover:scale-105 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
            aria-label={intl.formatMessage({
              id: "postcontent-mark-copy-ready-aria",
              description: "Mark as copy ready",
              defaultMessage: "Mark as copy ready"
            })}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center space-x-1">
              <FontAwesomeIcon icon={faCopy} className="h-3 w-3" />
              <span className="text-[10px] font-medium leading-tight">
                <FormattedMessage
                  id="postcontent-copy-ready"
                  description="Copy Ready"
                  defaultMessage="Copy Ready"
                />
              </span>
            </div>
          </button>

          <button 
            className="group relative overflow-hidden bg-emerald-500 hover:bg-emerald-600 text-white rounded p-1.5 transition-all duration-300 transform hover:scale-105 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
            aria-label={intl.formatMessage({
              id: "postcontent-mark-web-ready-aria",
              description: "Mark as web ready",
              defaultMessage: "Mark as web ready"
            })}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center space-x-1">
              <FontAwesomeIcon icon={faGlobe} className="h-3 w-3" />
              <span className="text-[10px] font-medium leading-tight">
                <FormattedMessage
                  id="postcontent-web-ready"
                  description="Web Ready"
                  defaultMessage="Web Ready"
                />
              </span>
            </div>
          </button>

          <button 
            className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white rounded p-1.5 transition-all duration-300 transform hover:scale-105 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            aria-label={intl.formatMessage({
              id: "postcontent-publish-post-aria",
              description: "Publish post",
              defaultMessage: "Publish post"
            })}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center space-x-1">
              <FontAwesomeIcon icon={faRocket} className="h-3 w-3" />
              <span className="text-[10px] font-medium leading-tight">
                <FormattedMessage
                  id="postcontent-publish"
                  description="Publish"
                  defaultMessage="Publish"
                />
              </span>
            </div>
          </button>
        </div>

        {/* Workflow Progress Bar */}
        <div className="mt-4 pt-3 border-t border-persian-blue-100 dark:border-fun-blue-400">
          <div className="flex items-center justify-between text-xs text-persian-blue-600 dark:text-caribbean-green-300 mb-2">
            <span>
              <FormattedMessage
                id="postcontent-workflow-progress"
                description="Workflow Progress"
                defaultMessage="Workflow Progress"
              />
            </span>
            <span className="font-medium">
              <FormattedMessage
                id="postcontent-workflow-complete"
                description="2/4 Complete"
                defaultMessage="2/4 Complete"
              />
            </span>
          </div>
          <div className="w-full bg-persian-blue-100 dark:bg-fun-blue-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-persian-blue-500 to-caribbean-green-500 h-2 rounded-full transition-all duration-500" style={{width: '50%'}}></div>
          </div>
        </div>
      </div>

      {/* User Image and Sharing Button SECTION */}
      <div className="bg-gradient-to-r from-blog-white to-gray-50 dark:from-fun-blue-500 dark:to-fun-blue-600 rounded-lg p-4 border border-gray-100 dark:border-fun-blue-400">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          {/* Author Profile Card */}
          <div className="flex items-center gap-4 group relative">
            
            {/* USER IMAGE with enhanced styling */}
            <Link href={`/${post?.username}`} legacyBehavior>
              <div className="relative cursor-pointer">
                {post?.photo_url && post?.photo_url ? (
                  <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-persian-blue-200 dark:ring-caribbean-green-300 ring-offset-2 transition-all duration-300 group-hover:ring-persian-blue-400 dark:group-hover:ring-caribbean-green-400 group-hover:scale-105">
                    <Image
                      width={200}
                      height={200}
                      src={post?.photo_url}
                      alt={`${post?.username} profile`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-persian-blue-400 to-caribbean-green-400 flex items-center justify-center text-white font-bold text-lg ring-2 ring-persian-blue-200 ring-offset-2">
                    {post?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-caribbean-green-500 rounded-full border-2 border-white dark:border-fun-blue-500"></div>
              </div>
            </Link>

            {/* Author Info Card */}
            <div className="flex flex-col">
              <Link href={`/${post?.username}`} className="group">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-persian-blue-600 dark:group-hover:text-caribbean-green-300 transition-colors duration-200">
                  {post?.username}
                </h3>
              </Link>
              
              {/* Post Metadata with enhanced styling */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300 mt-1">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-persian-blue-400"></div>
                  {dateFormat}
                </span>
                <span className="hidden sm:flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-caribbean-green-400"></div>
                  {minutesToRead} <FormattedMessage
                    id="postcontent-min-read"
                    description="min read"
                    defaultMessage="min read"
                  />
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-hit-pink-400"></div>
                  {wordCount} <FormattedMessage
                    id="postcontent-words"
                    description="words"
                    defaultMessage="words"
                  />
                </span>
              </div>
            </div>
          </div>


          {/* Action Buttons Row */}
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Edit Button - Enhanced */}
            {profile?.id === post?.uid && (
              <Link href={`/admin/${post?.slug}`} legacyBehavior>
                <button className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-fun-blue-600 dark:hover:bg-fun-blue-700 text-slate-700 dark:text-white rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
                  <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
              </Link>
            )}

            {/* Approve Button - Enhanced */}
            {approve && (
              <button
                onClick={() => approvePost(post)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-600 dark:hover:bg-green-700 text-green-700 dark:text-white rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
              >
                <FontAwesomeIcon icon={faThumbsUp} className="h-4 w-4" />
                <span className="text-sm font-medium">
                  <FormattedMessage
                    id="postcontent-approve-button"
                    description="Approve"
                    defaultMessage="Approve"
                  />
                </span>
              </button>
            )}

            {/* Heart/Sign Up Section */}
            <div className="flex items-center">
              <AuthCheck
                fallback={
                  <Link href="/enter" legacyBehavior>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-hit-pink-500 to-hit-pink-600 hover:from-hit-pink-600 hover:to-hit-pink-700 text-white rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-hit-pink-400 focus:ring-offset-2 shadow-sm">
                      <FontAwesomeIcon icon={faHeart} className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        <FormattedMessage 
                          id="post-content-auth-check-signup"
                          description="text on heart button when not signed in"
                          defaultMessage="Sign up" 
                        />
                      </span>
                    </button>
                  </Link>
                }
              >
                <HeartButton post={post} userId={profile?.id}/>
              </AuthCheck>
            </div>

            {/* Social Sharing with enhanced design */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-fun-blue-400">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden sm:block">Share:</span>
              
              {/* LinkedIn */}
              <BasicTooltip title={intl.formatMessage({
                id: "postcontent-share-linkedin",
                description: "Share on LinkedIn",
                defaultMessage: "Share on LinkedIn"
              })} placement="bottom">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=https://www.swapnilsrivastava.eu/${post?.username}/${post?.slug}`}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                >
                  <FontAwesomeIcon icon={faLinkedin} className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </a>
              </BasicTooltip>

              {/* Twitter */}
              <BasicTooltip title={intl.formatMessage({
                id: "postcontent-share-twitter",
                description: "Share on Twitter",
                defaultMessage: "Share on Twitter"
              })} placement="bottom">
                <a
                  href={`https://twitter.com/intent/tweet?text=Hi%2C%20checkout%20this%20post%20&url=https://www.swapnilsrivastava.eu/${post?.username}/${post?.slug}&via=swapnil_sri&hashtags=reactjs,nextjs,blog`}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/30 dark:hover:bg-sky-800/40 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
                >
                  <FontAwesomeIcon icon={faXTwitter} className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                </a>
              </BasicTooltip>

              {/* Facebook */}
              <BasicTooltip title={intl.formatMessage({
                id: "postcontent-share-facebook",
                description: "Share on Facebook",
                defaultMessage: "Share on Facebook"
              })} placement="bottom">
                <a
                  href={`https://facebook.com/sharer/sharer.php?u=https://www.swapnilsrivastava.eu/${post?.username}/${post?.slug}`}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                >
                  <FontAwesomeIcon icon={faFacebook} className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                </a>
              </BasicTooltip>

              {/* Ellipsis Button */}
              {/* <BasicTooltip title="More options" placement="bottom">
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-fun-blue-900/30 dark:hover:bg-fun-blue-800/40 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  onClick={() => alert("work in progress: more share options")}
                >
                  <FontAwesomeIcon icon={faEllipsis} className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </BasicTooltip> */}
            </div>
          </div>
        </div>
      </div>

      {/* ARTICLE SECTION */}
      <div className="bg-blog-white dark:bg-fun-blue-500 dark:text-blog-white p-3 flex flex-col gap-5">
        {/* TITLE SECTION */}
        <div className="lg:text-3xl text-xl font-extrabold self-center">
          {post?.title}
        </div>

        {/* Mobile Engagement Bar - Mobile Only */}
        {post?.heart_count && post.heart_count > 0 && (
          <div className="lg:hidden flex items-center justify-center gap-4 py-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 px-4 py-2 rounded-full border border-red-100 dark:border-red-800">
              <FontAwesomeIcon 
                icon={faHeart} 
                className="h-4 w-4 text-red-500" 
              />
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                {post.heart_count}
              </span>
            </div>
            
            {/* Reading time indicator */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>{minutesToRead} <FormattedMessage
                id="postcontent-min-read-2"
                description="min read"
                defaultMessage="min read"
              /></span>
            </div>
          </div>
        )}

        {/* Audio Player // Only show if the URL exists */}
        <div>
          {audioUrl ? (
            <>
              <AudioPlayer audioSource={audioUrl} />
            </>
          ) : (
            <></>
          )}
        </div>

        {/* POST SECTION */}
        <div
          className="post-content lg:text-xl"
          dangerouslySetInnerHTML={{ __html: post?.content }}
        ></div>
      </div>

      <Video videoSrc={post?.videoLink} />
    </div>
  </>;
}
