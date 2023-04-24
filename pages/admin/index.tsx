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
import { RootState } from "../../lib/interfaces/interface";

import { POST } from "../../database.types";
import { User } from "@supabase/supabase-js";

// e.g. localhost:3000/admin

function Admin() {
  return (
    <>
      <AuthCheck>
        <CreateNewPost></CreateNewPost>
        <SendSMS></SendSMS>
        <PostList></PostList>
      </AuthCheck>
    </>
  );
}

function PostList() {
  const [posts, setPosts] = useState<POST[]>([]);
  const [userAuth, setUserAuth] = useState<User>();

  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  useEffect(() => {
    fetchPost();
  }, []);

  async function fetchPost() {
    const {
      data: { user },
    } = await supaClient.auth.getUser();

    setUserAuth(user);

    let { data: posts, error } = await supaClient
      .from("posts")
      .select("*")
      .like("username", profile?.username);

    setPosts(posts);
  }

  return (
    <>
      <div className="flex items-center justify-center">
        <h1 className="dark:text-blog-white">Manage your Posts</h1>
      </div>
      <div className="flex flex-col gap-2">
        <PostFeed posts={posts} user={userAuth} />
      </div>
    </>
  );
}

function CreateNewPost() {
  const router = useRouter();

  const selectUser = (state: RootState) => state.users;
  const { user, username, userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  const [title, setTitle] = useState("");

  // Ensure slug is URL safe
  const slug = encodeURI(kebabCase(title));

  // Validate length
  const isValid = title.length > 3 && title.length < 100;

  // Create a new post in supabase postgres
  const createPost = async (e) => {
    e.preventDefault();

    // Tip: give all fields a default value here
    const { data, error } = await supaClient.from("posts").insert([
      {
        uid: profile?.id,
        photo_url: profile?.avatar_url,
        username: profile?.username,
        content: "# hello world!",
        title: title,
        slug: slug,
        approved: false,
        published: false,
      },
    ]);

    toast.success("Post created!");

    // Imperative navigation after doc is set
    router.push(`/admin/${slug}`);
  };

  const clearTitle = async (e) => {
    e.preventDefault();
    setTitle("");
  };

  return (
    <form onSubmit={createPost}>
      <div
        className="flex item-center border-b border-fun-blue-500 dark:border-fun-blue-300 py-4
        dark:bg-blog-white
        "
      >
        <span className="sr-only">
          Add a new article title and create the post
        </span>

        <div className="relative w-full mx-3">
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Not supposed to be seen"
            className="peer dark:bg-blog-white
            text-fun-blue-500
            dark:text-fun-blue-500
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
          className="border border-fun-blue-500 dark:border-fun-blue-500
          text-fun-blue-500 
          dark:text-fun-blue-500
          hover:text-fun-blue-400 
          dark:hover:text-slate-300 
          text-sm rounded py-1 px-2 mx-1 mr-4"
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
      const { data, status } = await axios.post(
        "/api/sendemail",
        emailMessage,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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

  // TODO: add logic so only Swapnil can see
  return false ? (
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
