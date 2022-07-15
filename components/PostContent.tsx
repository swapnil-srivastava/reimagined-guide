import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import moment from "moment";
import HeartButton from "./HeartButton";
import AuthCheck from "./AuthCheck";
import { LoginIcon, DotsHorizontalIcon} from "@heroicons/react/outline";
import { PencilAltIcon } from "@heroicons/react/solid";

interface RootState {
  counter: Object;
  users: UserState;
}

interface UserState {
  user: User;
  username: any;
}

interface User {
  uid: String;
}


// UI component for main post content
export default function PostContent({ post, postRef }) {
  // TS infers type: (state: RootState) => boolean
  const selectUser = (state: RootState) => state.users;
  const { user: currentUser, username } = useSelector(selectUser);

  const createdAt =
    typeof post?.createdAt === "number"
      ? new Date(post.createdAt)
      : post.createdAt.toDate();
  const wordCount = post?.content.trim().split(/\s+/g).length;
  const minutesToRead = (wordCount / 100 + 1).toFixed(0);
  const dateFormat = moment(post.createdAt).isValid()
    ? moment(post.createdAt).format("MMM DD")
    : moment(post.createdAt.toMillis()).format("MMM DD");

  return (
    <>
      <div className="bg-blog-white dark:bg-fun-blue-500 
                    dark:text-blog-white p-3">
        <div className="flex items-center justify justify-between gap-x-2">
          {/* USER DETAIL INFO : User Image with username and details about the post */}
          <div className="flex items-center gap-x-2">

            {/*  USER NAME SECTION */}
            <div>
              {/* USER IMAGE ICON and REDIRECT to PROFILE page */}
              <Link href={`/${post.username}`}>
                {post?.photoURL && post?.photoURL ? (
                  <div
                    className="w-12 h-12
                               rounded-full cursor-pointer flex items-center 
                               overflow-hidden"
                  >
                    <Image width={200} height={200} src={post.photoURL} alt="" />
                  </div>
                ) : (
                  <div className="text-xs font-thin">{` ${post.username}`}</div>
                )}
              </Link>
            </div>

            {/* POST DETAIL SECTION  */}
            <div className="flex flex-col">

              {/* USER NAME DETAIL */}
              <div className="flex gap-x-2">
                <div className="font-extralight text-base md:text-lg">
                  {`${post.username}`}
                </div>
              </div>

              {/* DATE, MIN TO READ and WORD COUNT DETAIL */}
              <div className="flex gap-x-2">
                <div className="font-extralight text-base md:text-lg">{`${dateFormat}`}</div> 
                <div className="font-extralight text-base md:text-lg">
                    {minutesToRead} min read
                </div>
                <div className="font-extralight text-base md:text-lg">{wordCount} words</div>
                <div className="font-extralight text-base md:text-lg">
                  <strong>{post.heartCount || 0} 🤍</strong>
                </div>
              </div>
            </div>
          </div>
          
          {/* EDIT BUTTON : edit button icon visible only when user has authentication to edit */}
          {currentUser?.uid === post.uid && ( 
            <div>
              <Link href={`/admin/${post.slug}`}>
                <button className="focus:outline-none focus:ring-2 
                focus:ring-fun-blue-400 
                focus:ring-offset-2 text-sm
                font-semibold">
                  <PencilAltIcon className="bg-fun-blue-300 dark:text-blog-black 
                    w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] 
                    p-1 m-1 rounded-full flex items-center justify-center 
                    transition-filter duration-500 hover:filter hover:brightness-125" />
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* HEART SECTION : logged in user to heart the post and sign up button redirect to login in page */}
        <div className="flex items-center mt-3 md:mt-5 gap-x-2">
          {/* AUTH CHECK SECTION - SIGN UP BUTTON */}
          <AuthCheck
            fallback={
              <div className='flex items-center'>
                <Link href="/enter">
                  <button className="bg-hit-pink-500 dark:text-blog-black px-3 py-2 mx-1 
                                      rounded-3xl flex items-center justify-center 
                                      transition-filter duration-500 hover:filter hover:brightness-125
                                      focus:outline-none focus:ring-2 
                                      focus:ring-fun-blue-400 
                                      focus:ring-offset-2
                                      font-semibold">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-1 hover:stroke-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <div className='ml-2 text-xs font-light'>
                        Sign Up
                      </div>
                  </button>
                </Link>
              </div>
            }
          >
            {/* HEART BUTTON / REMOVE HEART BUTTON */}
            <HeartButton postRef={postRef} />
          </AuthCheck>

          {/* LINKEDIN BUTTON */}
          <button className="rounded-full
              focus:outline-none focus:ring-2
              focus:ring-fun-blue-400 
              focus:ring-offset-2
              font-semibold"
              onClick={() => alert("work in progress : linkedin")}
              >
                <LoginIcon className="bg-fun-blue-300 dark:text-blog-black w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125" />
          </button>

          {/* TWITTER BUTTON */}
          <button className="rounded-full
              focus:outline-none focus:ring-2
              focus:ring-fun-blue-400 
              focus:ring-offset-2
              font-semibold"
              onClick={() => alert("work in progress : twitter")}
              >
                <LoginIcon className="bg-fun-blue-300 dark:text-blog-black w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125" />
          </button>

          {/* FACEBOOK ICON */}
          <button className="rounded-full
              focus:outline-none focus:ring-2
              focus:ring-fun-blue-400 
              focus:ring-offset-2
              font-semibold"
              onClick={() => alert("work in progress : facebook")}
              >
                <LoginIcon className="bg-fun-blue-300 dark:text-blog-black 
                w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] 
                p-0.5 m-0.5 rounded-full flex items-center justify-center 
                transition-filter duration-500 hover:filter hover:brightness-125
                " />
          </button>

          {/* THREE DOT BUTTON */}
          <button className="rounded-full
              focus:outline-none focus:ring-2
              focus:ring-fun-blue-400 
              focus:ring-offset-2
              font-semibold"
              onClick={() => alert("work in progress: share a post")}
              >
                <DotsHorizontalIcon className="bg-fun-blue-300 dark:text-blog-black 
                w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] 
                p-0.5 m-0.5 rounded-full flex items-center justify-center 
                transition-filter duration-500 hover:filter hover:brightness-125" />
          </button>
        </div>

      </div>

      {/* ARTICLE SECTION */}
      <div className="bg-blog-white dark:bg-fun-blue-500 
                    dark:text-blog-white p-3 flex flex-col gap-3">
        {/* TITLE SECTION */}
        <div className="text-3xl font-extrabold">{post?.title}</div>
        {/* POST SECTION */}
        <div className="text-xl font-light">
          <ReactMarkdown>{post?.content}</ReactMarkdown>
        </div>
      </div>
    </>
  );
}
