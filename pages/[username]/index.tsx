import React from "react";
import PostFeed from "../../components/PostFeed";
import UserProfile from "../../components/UserProfile";
import { supaClient } from "../../supa-client";

// e.g. localhost:3000/swapnil
// e.g. localhost:3000/ria

export async function getUserWithSupabaseforUserPage(username) {
  let { data: posts, error } = await supaClient
    .from("posts")
    .select("*")
    .like("username", username);

  return posts;
}

export async function getServerSideProps({ query }) {
  const { username } = query;
  const userPosts = await getUserWithSupabaseforUserPage(username);

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

    console.log("hello == profile", profiles);

    const [userProfile] = profiles;

    user = userProfile;

    let { data: supaPosts } = await supaClient
      .from("posts")
      .select("*")
      .like("username", username)
      .is("published", true);

    console.log("hello == published supaPosts", supaPosts);

    posts = supaPosts;
  }

  return {
    props: { user, posts }, // will be passed as props to the component
  };
}

function UserProfilePage({ user, posts }) {
  console.log("UserProfilePage ====> user", user);
  console.log("UserProfilePage ====> posts", posts);
  return (
    <>
      <UserProfile user={user}></UserProfile>
      <PostFeed posts={posts} admin enableLoadMore={false}></PostFeed>
    </>
  );
}

export default UserProfilePage;
