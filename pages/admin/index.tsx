import styles from "../../styles/Admin.module.css";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import kebabCase from "lodash.kebabcase";
import toast from "react-hot-toast";
import axios from "axios";

import AuthCheck from "../../components/AuthCheck";
import PostFeed from "../../components/PostFeed";

// supabase instance in the app
import { supaClient } from "../../supa-client";
import { SupashipUserInfo } from "../../lib/hooks";

import { onlySwapnilCanSee } from "../../lib/firebase";

interface RootState {
  counter: Object;
  users: UserState;
}

interface UserState {
  user: User;
  username: any;
  userInfo: SupashipUserInfo;
}

interface User {
  uid: string;
  displayName: string;
  photoURL: string;
}

// e.g. localhost:3000/admin

function Admin() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPost();
  }, []);

  const fetchPost = async () => {
    let { data: posts, error } = await supaClient.from("posts").select("*");
    setPosts(posts);
  };

  return (
    <>
      <AuthCheck>
        <CreateNewPost></CreateNewPost>
        <SendSMS></SendSMS>
        <PostList postlist={posts}></PostList>
      </AuthCheck>
    </>
  );
}

function PostList({ postlist }) {
  return (
    <>
      <div className="flex items-center justify-center">
        <h1 className="dark:text-blog-white">Manage your Posts</h1>
      </div>
      <PostFeed posts={postlist} admin enableLoadMore={false} />
    </>
  );
}

function CreateNewPost() {
  const router = useRouter();

  // TS infers type: (state: RootState) => boolean
  const selectUser = (state: RootState) => state.users;
  const { user, username, userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  const [title, setTitle] = useState("");

  // Ensure slug is URL safe
  const slug = encodeURI(kebabCase(title));

  // Validate length
  const isValid = title.length > 3 && title.length < 100;

  // Create a new post in firestore
  const createPost = async (e) => {
    e.preventDefault();

    // Tip: give all fields a default value here
    const { data, error } = await supaClient.from("posts").insert([
      {
        uid: profile?.id,
        photo_url: profile?.avatar_url,
        content: "# hello world!",
        title: title,
        slug: slug,
        approved: false,
        published: false,
      },
    ]);

    toast.success("Post created!");

    // Imperative navigation after doc is set
    // router.push(`/admin/${slug}`);
  };

  const clearTitle = async (e) => {
    e.preventDefault();
    setTitle("");
  };

  return (
    <form onSubmit={createPost}>
      <div className="flex item-center border-b border-fun-blue-500 dark:border-fun-blue-300 py-2">
        <span className="sr-only">
          Add a new article title and create the post
        </span>

        <div className="relative w-full mx-3">
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Not supposed to be seen"
            className="peer dark:bg-transparent
            dark:bg-slate-500
            text-fun-blue-500
            dark:text-slate-50
            bg-blog-white
            border-none 
            focus:outline-none
            block 
            w-full 
            rounded-sm
            text-sm 
            md:text-lg
            leading-tight
            h-10
            placeholder-transparent
          "
          />
          <label
            htmlFor="title"
            className="absolute left-0 -top-3.5 
            text-fun-blue-600 text-sm 
            transition-all 
            peer-placeholder-shown:text-base 
            peer-placeholder-shown:text-fun-blue-400 
            peer-placeholder-shown:top-2 
            peer-focus:-top-3.5 
            peer-focus:text-fun-blue-600
            peer-focus:text-sm"
          >
            Enter Your Next Big Article Title!
          </label>
        </div>

        <button type="submit" disabled={!isValid} className={styles.btnAdmin}>
          Create
        </button>
        <button
          className="border border-fun-blue-500 dark:border-blog-white text-fun-blue-500 dark:text-blog-white hover:text-fun-blue-400 dark:hover:text-slate-300 text-sm rounded py-1 px-2 mx-1 mr-4"
          type="button"
          onClick={clearTitle}
        >
          Cancel
        </button>
      </div>
      <p className="p-1 m-1 dark:text-blog-white text-sm md:text-lg">
        Article URL : {slug || `your-next-big-article-title`}
      </p>
    </form>
  );
}

function SendSMS() {
  async function sendSMS(object) {
    const phoneMessage = {
      phone: "+4915163579215",
      message: "Hello World from NextJS App by Swapnil Srivastava",
    };

    try {
      const { data, status } = await axios.post(
        "/api/sendmessage",
        phoneMessage,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(`SMS sent to ${phoneMessage.phone}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("error message: ", error.message);
        toast.success("Axios Error SMS");
        return error.message;
      } else {
        console.log("unexpected error: ", error);
        toast.success("Error SMS");
        return "An unexpected error occurred";
      }
    }
  }

  async function sendEmail(object) {
    const emailMessage = {
      from: "contact@swapnilsrivastava.eu",
      to: "contact@swapnilsrivastava.eu",
      subject: "Hello from Postmark",
      htmlBody: "<strong>Hello</strong> dear Postmark user.",
      textBody: "Hello from Postmark!",
      messageStream: "outbound",
    };

    try {
      const { data, status } = await axios.post("/api/sendemail", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success(`Email sent`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("error message: ", error.message);
        toast.success("Axios Error SMS");
        return error.message;
      } else {
        console.log("unexpected error: ", error);
        toast.success("Error SMS");
        return "An unexpected error occurred";
      }
    }
  }

  async function callNestApi() {
    try {
      const { data, status } = await axios.get(
        "https://reimagined-octo-potato-smoky.vercel.app/helloworld",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(`Called Nest JS Hello World ${data}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("error message: ", error.message);
        toast.error("Axios Nest JS ");
        return error.message;
      } else {
        console.log("unexpected error: ", error);
        toast.error("Error Nest JS");
        return "An unexpected error occurred";
      }
    }
  }

  async function callExpressApi(value: string) {
    try {
      const { data, status } = await axios.get(
        `https://miniature-giggle-five.vercel.app/${value}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(`Called Express JS Hello ${data}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("error message: ", error.message);
        toast.error("Axios Express JS ");
        return error.message;
      } else {
        console.log("unexpected error: ", error);
        toast.error("Error Express JS");
        return "An unexpected error occurred";
      }
    }
  }

  return onlySwapnilCanSee() ? (
    <div className="flex items-center justify-center">
      <button
        className="
                py-1 px-2
                font-light
                text-sm
                bg-hit-pink-500 
                border-4 border-hit-pink-500 
                rounded
                hover:filter hover:brightness-125
                ml-1"
        onClick={sendSMS}
      >
        SEND SMS
      </button>
      <button
        className="
                py-1 px-2
                font-light
                text-sm
                bg-hit-pink-500 
                border-4 border-hit-pink-500 
                rounded
                hover:filter hover:brightness-125
                ml-1"
        onClick={sendEmail}
      >
        SEND Email
      </button>
      <button
        className="
                py-1 px-2
                font-light
                text-sm
                bg-hit-pink-500 
                border-4 border-hit-pink-500 
                rounded
                hover:filter hover:brightness-125
                ml-1"
        onClick={callNestApi}
      >
        NestJS HelloWorld
      </button>
      <button
        className="
                py-1 px-2
                font-light
                text-sm
                bg-hit-pink-500 
                border-4 border-hit-pink-500 
                rounded
                hover:filter hover:brightness-125
                ml-1"
        onClick={() => callExpressApi("healthcheck")}
      >
        ExpressJS Health Check
      </button>
      <button
        className="
                py-1 px-2
                font-light
                text-sm
                bg-hit-pink-500 
                border-4 border-hit-pink-500 
                rounded
                hover:filter hover:brightness-125
                ml-1"
        onClick={() => callExpressApi("hello")}
      >
        ExpressJS Hello
      </button>
    </div>
  ) : (
    <></>
  );
}

export default Admin;
