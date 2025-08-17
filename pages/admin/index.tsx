import styles from "../../styles/Admin.module.css";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import kebabCase from "lodash.kebabcase";
import toast from "react-hot-toast";
import axios from "axios";
import { FormattedMessage } from "react-intl";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              <FormattedMessage
                id="admin-title"
                description="Manage your Posts"
                defaultMessage="Manage your Posts"
              />
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create, edit, and publish your articles
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-fun-blue-600 rounded-lg px-4 py-2 border border-gray-200 dark:border-fun-blue-500">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Posts</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{posts.length}</div>
            </div>
            <div className="bg-white dark:bg-fun-blue-600 rounded-lg px-4 py-2 border border-gray-200 dark:border-fun-blue-500">
              <div className="text-sm text-gray-600 dark:text-gray-400">Published</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {posts.filter(post => post.published).length}
              </div>
            </div>
            <div className="bg-white dark:bg-fun-blue-600 rounded-lg px-4 py-2 border border-gray-200 dark:border-fun-blue-500">
              <div className="text-sm text-gray-600 dark:text-gray-400">Drafts</div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {posts.filter(post => !post.published).length}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 border-b border-gray-200 dark:border-fun-blue-500">
          <nav className="-mb-px flex space-x-8">
            <button className="py-2 px-1 border-b-2 border-fun-blue-500 font-medium text-sm text-fun-blue-600 dark:text-caribbean-green-400">
              All Posts ({posts.length})
            </button>
            <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600">
              Published ({posts.filter(post => post.published).length})
            </button>
            <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600">
              Drafts ({posts.filter(post => !post.published).length})
            </button>
          </nav>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          <PostFeed posts={posts} user={userAuth} admin={true} />
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="bg-gray-50 dark:bg-fun-blue-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start writing your first article to share your thoughts with the world
            </p>
            <button className="inline-flex items-center px-4 py-2 bg-fun-blue-600 hover:bg-fun-blue-700 text-white rounded-lg font-medium transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Post
            </button>
          </div>
        )}
      </div>
    </div>
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <form onSubmit={createPost} className="space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            Create New Article
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Share your thoughts with the world and inspire others with your story
          </p>
        </div>

        {/* Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Input Section - Takes 2 columns on desktop */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-fun-blue-600 rounded-2xl shadow-sm border border-gray-200 dark:border-fun-blue-500 p-6 sm:p-8 transition-all duration-200 hover:shadow-md">
              <span className="sr-only">
                <FormattedMessage
                  id="admin-article-sr-only-text"
                  description="Add a new article title and create the post"
                  defaultMessage="Add a new article title and create the post"
                />
              </span>

              {/* Title Input */}
              <div className="space-y-6">
                <div className="relative">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
                  >
                    <FormattedMessage
                      id="admin-article-input-text"
                      description="Enter Your Next Big Article Title!"
                      defaultMessage="Enter Your Next Big Article Title!"
                    />
                  </label>
                  <div className="relative">
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What's your story about?"
                      className="w-full px-5 py-5 pr-20 text-lg lg:text-xl bg-gray-50 dark:bg-fun-blue-700 border border-gray-300 dark:border-fun-blue-400 rounded-xl 
                        text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-fun-blue-500 focus:border-transparent
                        transition-all duration-200 hover:border-gray-400 dark:hover:border-fun-blue-300
                        resize-none"
                    />
                    {/* Character Counter - Fixed positioning */}
                    <div className="absolute right-4 top-4 bg-white dark:bg-fun-blue-600 px-2 py-1 rounded-md text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-fun-blue-500">
                      {title.length}/100
                    </div>
                  </div>
                  
                  {/* Validation Indicator */}
                  {title.length > 0 && (
                    <div className="mt-3 flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        isValid ? 'bg-green-500' : 'bg-orange-500'
                      }`}></div>
                      <span className={`text-sm ${
                        isValid ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                      }`}>
                        {isValid ? 'Title looks perfect!' : 'Title must be 4-100 characters'}
                      </span>
                    </div>
                  )}
                </div>

                {/* URL Preview */}
                {title && (
                  <div className="bg-gray-50 dark:bg-fun-blue-700 rounded-xl p-5 border border-gray-200 dark:border-fun-blue-400">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      <FormattedMessage
                        id="admin-article-url"
                        description="Article URL:"
                        defaultMessage="Article URL:"
                      />
                    </p>
                    <div className="flex items-center text-sm font-mono bg-white dark:bg-fun-blue-600 rounded-lg p-3 border border-gray-200 dark:border-fun-blue-500">
                      <span className="text-gray-500 dark:text-gray-400">
                        swapnilsrivastava.eu/
                      </span>
                      <span className="text-fun-blue-600 dark:text-caribbean-green-400 break-all font-medium">
                        {profile?.username}/{slug || 'your-article-slug'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={!isValid}
                    className={`flex-1 py-4 px-8 rounded-xl font-medium text-white transition-all duration-200 ${
                      isValid
                        ? 'bg-gradient-to-r from-fun-blue-500 to-fun-blue-600 hover:from-fun-blue-600 hover:to-fun-blue-700 shadow-sm hover:shadow-lg transform hover:scale-[1.02]'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <FormattedMessage
                      id="admin-article-create-btn"
                      description="Create button while creating the article"
                      defaultMessage="Create Article"
                    />
                  </button>
                  
                  <button
                    type="button"
                    onClick={clearTitle}
                    className="py-4 px-8 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-fun-blue-700 
                      border border-gray-300 dark:border-fun-blue-400 hover:bg-gray-200 dark:hover:bg-fun-blue-800 
                      transition-all duration-200 hover:scale-[1.02]"
                  >
                    <FormattedMessage
                      id="admin-article-cancel-btn"
                      description="Cancel button while creating the article"
                      defaultMessage="Clear"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Sidebar - Only visible on large screens */}
          <div className="hidden lg:block space-y-6">
            {/* Tips Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-fun-blue-700 dark:to-fun-blue-800 rounded-xl p-6 border border-blue-200 dark:border-fun-blue-400 sticky top-8">
              <h4 className="text-base font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center">
                <span className="text-2xl mr-2">💡</span>
                Writing Tips
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Keep your title clear and descriptive
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Use keywords that readers might search for
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Aim for 6-12 words for optimal engagement
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Make it compelling enough to click
                </li>
              </ul>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-fun-blue-600 rounded-xl p-6 border border-gray-200 dark:border-fun-blue-500 shadow-sm">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Article Stats
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Words</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {title.split(' ').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Characters</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {title.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Readability</span>
                  <span className={`text-sm font-medium ${
                    isValid ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {isValid ? 'Good' : 'Needs work'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tips Section - Only visible on mobile */}
        <div className="lg:hidden bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-fun-blue-700 dark:to-fun-blue-800 rounded-xl p-4 border border-blue-200 dark:border-fun-blue-400">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            💡 Writing Tips
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
            <li>• Keep your title clear and descriptive</li>
            <li>• Use keywords that readers might search for</li>
            <li>• Aim for 6-12 words for optimal engagement</li>
          </ul>
        </div>
      </form>
    </div>
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
