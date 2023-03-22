import React from "react";
import PostFeed from "../../components/PostFeed";
import UserProfile from "../../components/UserProfile";
import { supaClient } from "../../supa-client";

// e.g. localhost:3000/swapnil
// e.g. localhost:3000/ria

export async function getUserWithSupabaseforUserPage(username) {
  let { data: supaUsers, error } = await supaClient
    .from("profiles")
    .select("*")
    .like("username", username);

  return supaUsers;
}

export async function getServerSideProps({ query }) {
  const { username } = query;
  const users = await getUserWithSupabaseforUserPage(username);

  // If no user, short circuit to 404 page
  if (users.length === 0) {
    return {
      notFound: true,
    };
  }

  // JSON serializable data
  let user = null;
  let posts = null;

  if (users.length > 0) {
    const [userProfile] = users;

    user = userProfile;

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
