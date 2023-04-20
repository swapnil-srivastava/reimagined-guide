import { FormattedMessage } from "react-intl";

import PostFeed from "../components/PostFeed";
import Loader from "../components/Loader";

import { useState } from "react";
import Metatags from "../components/Metatags";
import { supaClient } from "../supa-client";
import { POST } from "../database.types";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesDown } from "@fortawesome/free-solid-svg-icons";

// Max post to query per page
const LIMIT = 5;

// export async function getServerSideProps(context) {
//   let { data: posts } = await supaClient
//     .from("posts")
//     .select("*")
//     .is("published", true)
//     .order("created_at", { ascending: false })
//     .range(0, LIMIT);

//   return {
//     props: { posts }, // will be passed to the page component as props
//   };
// }

export default function Home(props) {
  const [posts, setPosts] = useState<POST[]>([
    {
      id: "48acf818-b482-4b38-8c0c-358673530c80",
      uid: "6c574880-fe71-42c6-a290-8df7e53d2685",
      photo_url:
        "https://lh3.googleusercontent.com/a/AGNmyxbjCBwPcqKxF9AsZNW8Rl7T4c1oF9uTL_IUKKBJ4g=s96-c",
      username: "mudrikamishra",
      created_at: "2023-03-21T18:52:05.34801+00:00",
      updated_at: null,
      published: true,
      approved: false,
      slug: "my-first-article",
      title: "My first article ",
      content: "# hello world!",
      heartcount: 0,
      heartid: null,
    },
    {
      id: "e7222684-ef0c-4f0e-8891-cd9827950f1a",
      uid: "6c574880-fe71-42c6-a290-8df7e53d2685",
      photo_url:
        "https://lh3.googleusercontent.com/a/AGNmyxbjCBwPcqKxF9AsZNW8Rl7T4c1oF9uTL_IUKKBJ4g=s96-c",
      username: "mudrikamishra",
      created_at: "2023-03-21T18:49:49.791164+00:00",
      updated_at: "2023-03-22T16:21:04.02+00:00",
      published: true,
      approved: false,
      slug: "hello-post",
      title: "Hello post ",
      content:
        "# hello world!\n\nHello Again, as usual u are not listening \n\nmore things more things ",
      heartcount: 0,
      heartid: null,
    },
    {
      id: "c5a24dd9-6042-45a2-add1-99962b4a5670",
      uid: "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
      photo_url:
        "https://lh3.googleusercontent.com/a/AGNmyxYZ2HY0eAHIq91gA00DDlQXa5DNGsbY5EuJAdGuYg=s96-c",
      username: "swapnil",
      created_at: "2023-03-21T18:48:04.044298+00:00",
      updated_at: "2023-03-22T17:38:43.084+00:00",
      published: true,
      approved: false,
      slug: "one-more-article",
      title: "One more article ",
      content:
        "hello supabase \n\nadding lines in the supabase\n\nmaking changes in the website again \n\nseeing changes that update_at is also working \n\nmore document",
      heartcount: 0,
      heartid: null,
    },
    {
      id: "bdf70bbf-4a68-412e-8a87-b332b82bd4fe",
      uid: "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
      photo_url:
        "https://lh3.googleusercontent.com/a/AGNmyxYZ2HY0eAHIq91gA00DDlQXa5DNGsbY5EuJAdGuYg=s96-c",
      username: "swapnil",
      created_at: "2023-03-21T18:47:42.523943+00:00",
      updated_at: null,
      published: true,
      approved: false,
      slug: "one-more",
      title: "one more",
      content: "# hello world!",
      heartcount: 0,
      heartid: null,
    },
    {
      id: "d8651f25-7bb6-4a31-a40a-1b4596ac73ff",
      uid: "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
      photo_url:
        "https://lh3.googleusercontent.com/a/AGNmyxYZ2HY0eAHIq91gA00DDlQXa5DNGsbY5EuJAdGuYg=s96-c",
      username: "swapnil",
      created_at: "2023-03-21T18:46:57.753949+00:00",
      updated_at: "2023-03-25T15:26:52.761+00:00",
      published: true,
      approved: true,
      slug: "hello-supbase-with-logged-in-user",
      title: "Hello Supbase with logged in user",
      content: "# hello world!\n\nnnnm\n\nHello\n\nGghg",
      heartcount: 0,
      heartid: null,
    },
    {
      id: "3cf8ade3-90f2-42ad-bc3a-333b860da5f8",
      uid: "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
      photo_url:
        "https://lh3.googleusercontent.com/a/AGNmyxYZ2HY0eAHIq91gA00DDlQXa5DNGsbY5EuJAdGuYg=s96-c",
      username: null,
      created_at: "2023-03-20T17:40:00.749193+00:00",
      updated_at: "2023-03-22T20:37:43.202+00:00",
      published: true,
      approved: false,
      slug: "hello-mudrika",
      title: "hello mudrika",
      content: "# hello world!\n\nthis is the place where we write something ",
      heartcount: 0,
      heartid: null,
    },
  ]);
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
      <div className="lg:flex lg:flex-row flex-wrap gap-x-4 ml-4 mr-4">
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
