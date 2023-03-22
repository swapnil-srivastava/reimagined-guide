import styles from "../styles/Home.module.css";
import { FormattedMessage } from "react-intl";

import PostFeed from "../components/PostFeed";
import Loader from "../components/Loader";

import { useState } from "react";
import Metatags from "../components/Metatags";
import { supaClient } from "../supa-client";
import { POST } from "../database.types";

// Max post to query per page
const LIMIT = 5;

export async function getServerSideProps(context) {
  let { data: posts } = await supaClient
    .from("posts")
    .select("*")
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

      <FormattedMessage
        id="swapnil_intro"
        description="A message" // Description should be a string literal
        defaultMessage="My name is Swapnil Srivastava" // Message should be a string literal
      />
    </main>
  );
}
