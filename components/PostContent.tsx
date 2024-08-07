import Link from "next/link";
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
import { faHeart, faPenToSquare, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { FormattedMessage } from "react-intl";

// React Components
import HeartButton from "./HeartButton";
import BasicTooltip from "./Tooltip";
import AuthCheck from "./AuthCheck";
import Video from "./Video";

// Interface
import { RootState } from "../lib/interfaces/interface";
import { POST } from "../database.types";

// Supabase
import { supaClient } from "../supa-client";

// Email Service
import { sendEmail } from "../services/email.service";
import AudioPlayer from "./AudioPlayer";

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

      toast.success("Post approved successfully!");

      const articleURL = `https://swapnilsrivastava.eu/${post?.username}/${post?.slug}`;

      const emailMessage: Partial<postmark.Message> = {
        To: "contact@swapnilsrivastava.eu",
        Subject: "Article Approved",
        HtmlBody: `<strong>Hello</strong> Swapnil Srivastava, new article is approved on your website and visible, navigate to ${articleURL}`,
      };

      sendEmail(emailMessage);

      toast.success("Email confirmation sent!");
    }
  };

  return <>
    <div className="p-3 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-500 dark:text-blog-white rounded-lg drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
      {/* User Image and Sharing Button SECTION */}
      <div
        className="bg-blog-white dark:bg-fun-blue-500 
                  flex flex-col lg:flex-row justify-between
                  dark:text-blog-white p-3 gap-5"
      >
        <div className="flex items-center justify-between gap-x-2">
          {/* USER DETAIL INFO : User Image with username and details about the post */}

          <div className="flex items-center gap-x-2">
            {/*  USER NAME SECTION  */}

            <div>
              {/* USER IMAGE ICON and REDIRECT to PROFILE page */}
              <Link href={`/${post?.username}`} legacyBehavior>
                {post?.photo_url && post?.photo_url ? (
                  <div
                    className="w-12 h-12
                             rounded-full cursor-pointer flex items-center 
                             overflow-hidden"
                  >
                    <Image
                      width={200}
                      height={200}
                      src={post?.photo_url}
                      alt=""
                    />
                  </div>
                ) : (
                  <div className="text-xs font-thin">{`${post?.username}`}</div>
                )}
              </Link>
            </div>

            {/* POST DETAIL SECTION  */}
            <div className="flex flex-col">
              {/* USER NAME DETAIL */}
              <div className="flex gap-x-2">
                <Link
                  href={`/${post?.username}`}
                  className="font-extralight text-base md:text-lg">

                  {`${post?.username}`}

                </Link>
              </div>

              {/* DATE, MIN TO READ and WORD COUNT DETAIL */}
              <div className="flex gap-x-2">
                <div className="font-extralight text-base md:text-lg">{`${dateFormat}`}</div>
                <div className="font-extralight text-base md:text-lg">
                  {minutesToRead} min read
                </div>
                <div className="font-extralight text-base md:text-lg">
                  {wordCount} words
                </div>
                <div className="font-extralight text-base md:text-lg">
                  <strong>{post?.heart_count || 0} 🤍</strong>
                </div>
              </div>
            </div>
          </div>

          {/* EDIT BUTTON : edit button icon visible only when user has authentication to edit */}
          {profile?.id === post?.uid && (
            <div className="self-end">
              <Link href={`/admin/${post?.slug}`} legacyBehavior>
                <button
                  type="button"
                  className="focus:outline-none focus:ring-2 
                            focus:ring-fun-blue-400 
                            focus:ring-offset-2 text-sm
                            font-semibold bg-fun-blue-300 dark:text-blog-black 
                            p-2 m-1 flex rounded items-center justify-center gap-x-2
                            transition-filter duration-500 hover:filter hover:brightness-125"
                >
                  <FontAwesomeIcon icon={faPenToSquare} size="lg" />
                  <div className="font-light">Edit</div>
                </button>
              </Link>
            </div>
          )}

          {/* Approve BUTTON : Approve button icon visible only when user has authentication to aprrove */}
          {approve && (
            <div className="self-end">
              <button
                type="button"
                onClick={() => approvePost(post)}
                className="focus:outline-none focus:ring-2 
                            focus:ring-fun-blue-400 
                            focus:ring-offset-2 text-sm
                            font-semibold bg-fun-blue-300 dark:text-blog-black 
                            p-2 m-1 flex rounded items-center justify-center gap-x-2
                            transition-filter duration-500 hover:filter hover:brightness-125"
              >
                <FontAwesomeIcon icon={faThumbsUp} size="lg" />
                <div className="font-light">Approve</div>
              </button>
            </div>
          )}
        </div>

        {/* HEART SECTION : logged in user to heart the post and sign up button redirect to login in page */}
        <div className="flex items-center gap-x-2">
          {/* AUTH CHECK SECTION - SIGN UP BUTTON */}
          <AuthCheck
            fallback={
              <div className="flex items-center">
                <Link href="/enter" legacyBehavior>
                  <button
                    className="bg-hit-pink-500 dark:text-blog-black px-3 py-2 mx-1 
                                    rounded-3xl flex items-center justify-center 
                                    transition-filter duration-500 hover:filter hover:brightness-125
                                    focus:outline-none focus:ring-2 
                                    focus:ring-fun-blue-400 
                                    focus:ring-offset-2
                                    font-semibold"
                  >
                      <FontAwesomeIcon icon={faHeart} />
                    <div className="ml-2 text-xs font-light">
                            <FormattedMessage id="post-content-auth-check-signup"
                                description="text on heart button when not signed in" // Description should be a string literal
                                defaultMessage="Sign up" // Message should be a string literal
                                />
                    </div>
                  </button>
                </Link>
              </div>
            }
          >
            {/* HEART BUTTON / REMOVE HEART BUTTON */}
            <HeartButton post={post} userId={profile?.id}/>
          </AuthCheck>

          {/* LINKEDIN BUTTON */}
          <BasicTooltip title="Share on LinkedIn" placement="bottom">
            <button
              className="rounded-full
              focus:outline-none focus:ring-2
              focus:ring-fun-blue-400 
              focus:ring-offset-2
              flex
              font-semibold"
            >
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=https://www.swapnilsrivastava.eu/${post?.username}/${post?.slug}`}
              >
                <FontAwesomeIcon
                  icon={faLinkedin}
                  size="lg"
                  style={{ color: "#0072b1" }}
                />
              </a>
            </button>
          </BasicTooltip>

          {/* TWITTER BUTTON */}
          <BasicTooltip title="Share on twitter" placement="bottom">
            <button
              className="rounded-full
              focus:outline-none focus:ring-2
              focus:ring-fun-blue-400 
              focus:ring-offset-2
              flex
              font-semibold"
            >
              <a
                href={`https://twitter.com/intent/tweet?text=Hi%2C%20checkout%20this%20post%20&url=https://www.swapnilsrivastava.eu/${post?.username}/${post?.slug}&via=swapnil_sri&hashtags=reactjs,nextjs,blog`}
              >
              <FontAwesomeIcon icon={faXTwitter} size="lg" style={{ color: "#00acee" }}/>
              </a>
            </button>
          </BasicTooltip>

          {/* FACEBOOK ICON */}
          <BasicTooltip title="Share on facebook" placement="bottom">
            <button
              className="rounded-full
              focus:outline-none focus:ring-2
              focus:ring-fun-blue-400 
              focus:ring-offset-2
              flex
              font-semibold
              "
            >
              <a
                href={`https://facebook.com/sharer/sharer.php?u=https://www.swapnilsrivastava.eu/${post?.username}/${post?.slug}`}
              >
                <FontAwesomeIcon
                  icon={faFacebook}
                  size="lg"
                  style={{ color: "#4267B2" }}
                />
              </a>
            </button>
          </BasicTooltip>

          {/* THREE DOT BUTTON */}

          {/* <BasicTooltip title="Share" placement="bottom">
            <button
              className="rounded-full
              focus:outline-none focus:ring-2
              focus:ring-fun-blue-400 
              focus:ring-offset-2
              flex
              font-semibold 
              bg-fun-blue-300 dark:text-blog-black 
                w-6 h-6
                p-0.5 m-0.5 rounded-full flex items-center justify-center 
                transition-filter duration-500 hover:filter hover:brightness-125"
              onClick={() => alert("work in progress: share a post")}
            >
              <FontAwesomeIcon icon={faEllipsis} size="lg" />
            </button>
          </BasicTooltip> */}
        </div>
      </div>

      {/* ARTICLE SECTION */}
      <div
        className="bg-blog-white dark:bg-fun-blue-500 
                  dark:text-blog-white p-3 flex flex-col gap-5"
      >
        {/* TITLE SECTION */}
        <div className="lg:text-3xl text-xl font-extrabold self-center">
          {post?.title}
        </div>

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
