import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import moment from "moment";
import HeartButton from "./HeartButton";
import AuthCheck from "./AuthCheck";
import { LoginIcon, DotsHorizontalIcon} from "@heroicons/react/outline";
import { PencilAltIcon } from "@heroicons/react/solid";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';

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
                <Link href={`/${post.username}`}>
                  <a className="font-extralight text-base md:text-lg">
                      {`${post.username}`}
                  </a>
                </Link>
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
                {/* <FontAwesomeIcon icon={faCoffee} /> */}
                <svg className="dark:text-blog-black w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] 
                p-0.5 m-0.5 flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                  {/* <!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --> */}
                  <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/>
                </svg>
                {/* <LoginIcon className="bg-fun-blue-300 dark:text-blog-black w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125" /> */}
          </button>

          {/* TWITTER BUTTON */}
          <button className="rounded-full
              focus:outline-none focus:ring-2
              focus:ring-fun-blue-400 
              focus:ring-offset-2
              font-semibold"
              onClick={() => alert("work in progress : twitter")}
              >
                <svg className="dark:text-blog-black 
                w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-0.5 m-0.5 
                flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  {/* <!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --> */}
                  <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/>
                </svg>
                {/* <LoginIcon className="bg-fun-blue-300 dark:text-blog-black w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125" /> */}
          </button>

          {/* FACEBOOK ICON */}
          <button className="rounded-full
              focus:outline-none focus:ring-2
              focus:ring-fun-blue-400 
              focus:ring-offset-2
              font-semibold"
              onClick={() => alert("work in progress : facebook")}
              >
                <svg className="dark:text-blog-black w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] 
                p-0.5 m-0.5 flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/>
                </svg>
                {/* <LoginIcon className="bg-fun-blue-300 dark:text-blog-black 
                w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] 
                p-0.5 m-0.5 rounded-full flex items-center justify-center 
                transition-filter duration-500 hover:filter hover:brightness-125
                " /> */}
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
