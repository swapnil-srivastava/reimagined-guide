import React from "react";
import PostFeed from "../../components/PostFeed";
import UserProfile from "../../components/UserProfile";
import { getUserWithUsername, postToJSON } from "../../lib/firebase";
import { getUserWithUsernameSupabase } from "./[slug]";
import { supaClient } from "../../supa-client";

// e.g. localhost:3000/swapnil
// e.g. localhost:3000/ria
export async function getServerSideProps({ query }) {
  const { username } = query;
  const userPosts = await getUserWithUsernameSupabase(username);

  // If no user, short circuit to 404 page
  if (!userPosts) {
    return {
      notFound: true,
    };
  }

  // JSON serializable data
  let user = null;
  let posts = null;

  if (userPosts) {
    let { data: profiles } = await supaClient
      .from("profiles")
      .select("*")
      .like("username", username);

    user = profiles;

    let { data: supaPosts } = await supaClient
      .from("posts")
      .select("*")
      .like("username", username)
      .is("published", true);

    posts = supaPosts;
  }

  return {
    props: { user, posts }, // will be passed as props to the component
  };
}

function UserProfilePage({ user, posts }) {
  return (
    <>
      <UserProfile user={user}></UserProfile>
      <PostFeed posts={posts} admin enableLoadMore={false}></PostFeed>
    </>
  );
}

export default UserProfilePage;
