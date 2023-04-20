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

// export async function getStaticProps({ params }) {
//   const { username, slug } = params;
//   const userPosts = await getUserWithUsernameSupabase(username);

//   let post;
//   let path;

//   if (userPosts) {
//     let { data: posts, error } = await supaClient
//       .from("posts")
//       .select("*")
//       .like("slug", slug);
//     const [firstPost] = posts;

//     post = firstPost;
//     path = firstPost && firstPost?.slug;
//   }

//   return {
//     props: { post, path },
//     revalidate: 5000,
//   };
// }

// export async function getStaticPaths() {
//   let { data: posts, error } = await supaClient
//     .from("posts")
//     .select("username, slug")
//     .neq("username", null);

//   const paths = posts.map((post) => {
//     const { slug, username } = post;
//     return {
//       params: { username, slug },
//     };
//   });

//   return {
//     // must be in this format:
//     // paths: [
//     //   { params: { username, slug }}
//     // ],
//     paths,
//     fallback: "blocking",
//   };
// }

function Post(props) {
  const [post, setPost] = useState({
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
    title: "hello mudrika something ",
    content:
      "<h1># hello world!</h1><p></p><p><strong>Adding more text which is bold knkmnmnmnknk</strong></p><p></p><p><em>this text is italic</em></p><p></p><p><s>asdasd</s></p><p></p><pre><code>Hello how are you</code></pre><p></p><p></p><blockquote><p>ok something is there for block quote</p></blockquote><p></p><h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3><h4>Heading 4</h4><h5>Heading 5</h5><h6>Heading 6</h6><p></p><p>point 1</p><p>point 2</p><p></p><ol><li><p>something to be told</p></li><li><p>something to be heard</p></li></ol>",
    heartcount: 0,
    heartid: null,
  });

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
