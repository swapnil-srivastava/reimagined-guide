import styles from "../../styles/Post.module.css";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PostContent from "../../components/PostContent";
import Metatags from "../../components/Metatags";
import { SupashipUserInfo } from "../../lib/hooks";
import { supaClient } from "../../supa-client";

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
  uid: String;
}

// e.g. localhost:3000/swapnil/page1
// e.g. localhost:3000/swapnil/page2

/**`
 * Gets a users/{uid} document with username
 * @param  {string} username
 */
export async function getUserWithUsernameSupabase(username) {
  let { data: posts, error } = await supaClient
    .from("posts")
    .select("*")
    .like("username", username);

  return posts;
}

export async function getStaticProps({ params }) {
  const { username, slug } = params;
  const userPosts = await getUserWithUsernameSupabase(username);

  let post;
  let path;

  if (userPosts) {
    let { data: posts, error } = await supaClient
      .from("posts")
      .select("*")
      .like("slug", slug);
    const [firstPost] = posts;

    post = firstPost;
    path = firstPost && firstPost?.slug;
  }

  return {
    props: { post, path },
    revalidate: 5000,
  };
}

export async function getStaticPaths() {
  let { data: posts, error } = await supaClient
    .from("posts")
    .select("username, slug")
    .neq("username", null);

  const paths = posts.map((post) => {
    const { slug, username } = post;
    return {
      params: { username, slug },
    };
  });

  return {
    // must be in this format:
    // paths: [
    //   { params: { username, slug }}
    // ],
    paths,
    fallback: "blocking",
  };
}

function Post(props) {
  const [post, setPost] = useState(props.post);

  const fetchPost = async () => {
    let { data: posts, error } = await supaClient
      .from("posts")
      .select("*")
      .like("slug", props.path);

    const [firstPost] = posts;
    setPost(firstPost);
  };

  useEffect(() => {
    fetchPost();
  }, []);

  // TS infers type: (state: RootState) => boolean
  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  function generateMetaDescription(input) {
    if (input.length > 100) {
      return input.substring(0, 100) + "...";
    }
    return input;
  }

  return (
    <main className={styles.container}>
      <Metatags
        title={post.title}
        description={generateMetaDescription(post.content)}
      />

      <section className="basis-3/4 p-3">
        <PostContent post={post} />
      </section>
    </main>
  );
}

export default Post;
