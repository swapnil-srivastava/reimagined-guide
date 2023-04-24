import { FormattedMessage } from "react-intl";

import PostFeed from "../components/PostFeed";
import Loader from "../components/Loader";

import { useState } from "react";
import Metatags from "../components/Metatags";
import { supaClient } from "../supa-client";
import { POST } from "../database.types";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesDown } from "@fortawesome/free-solid-svg-icons";

import axios from "axios";
import toast from "react-hot-toast";

// Max post to query per page
const LIMIT = 5;

export async function getServerSideProps(context) {
  let { data: posts } = await supaClient
    .from("posts")
    .select("*")
    .is("approved", true)
    .is("published", true)
    .order("created_at", { ascending: false })
    .range(0, LIMIT);

  return {
    props: { posts }, // will be passed to the page component as props
  };
}

export default function Home(props) {
  const [posts, setPosts] = useState<POST[]>(props.posts);
  const [loading, setLoading] = useState<boolean>(false);

  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    setLoading(true);

    const last = posts[posts.length - 1];

    const { created_at: cursor } = last;

    let { data: oldPosts } = await supaClient
      .from("posts")
      .select("*")
      .is("published", true)
      .is("approved", true)
      .lt("created_at", cursor)
      .order("created_at", { ascending: false })
      .range(0, LIMIT);

    setPosts(posts.concat(oldPosts));

    setLoading(false);

    if (oldPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  };

  return (
    <main>
      <Metatags />
      <div className="p-3 flex justify-center items-center h-screen">
        <blockquote className="lg:text-8xl text-5xl font-semibold italic text-center text-slate-90 dark:text-blog-white text-blog-black">
          <FormattedMessage
            id="swapnil_architect_hello"
            description="an" // Description should be a string literal
            defaultMessage="Hi, I'm" // Message should be a string literal
          />{" "}
          <span className="before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-pink-500 relative inline-block mx-2 dark:text-blog-white text-blog-white">
            <span className="relative text-white">
              <FormattedMessage
                id="swapnil_name"
                description="Name of the Author" // Description should be a string literal
                defaultMessage="Swapnil Srivastava" // Message should be a string literal
              />
            </span>
          </span>
          <br />
          <span>
            <span>
              <FormattedMessage
                id="swapnil_architect_an"
                description="an" // Description should be a string literal
                defaultMessage="an" // Message should be a string literal
              />{" "}
            </span>
            <span className="underline decoration-fun-blue-500 dark:decoration-hit-pink-500 underline-offset-auto">
              <FormattedMessage
                id="swapnil_architect"
                description="Architect" // Description should be a string literal
                defaultMessage="Architect" // Message should be a string literal
              />
            </span>
          </span>
        </blockquote>
      </div>
      <div className="relative">
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bottom-16">
          <FontAwesomeIcon
            className="animate-bounce h-15 w-15 dark:text-blog-white text-fun-blue-500"
            icon={faAnglesDown}
            size={"3x"}
          />
        </div>
      </div>
      <div className="lg:flex lg:flex-row flex-wrap gap-x-4 gap-y-2 ml-4 mr-4">
        <PostFeed
          posts={posts}
          parentFunction={() => getMorePosts()}
          loading={loading}
          postsEnd={postsEnd}
          enableLoadMore={true}
        />
      </div>

      <div className="flex items-center justify-center">
        <Loader show={loading} />
      </div>

      {postsEnd && (
        <div className="flex items-center justify-center dark:text-blog-white">
          You have reached the end!
        </div>
      )}
    </main>
  );
}
