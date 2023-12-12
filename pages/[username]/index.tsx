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
  let userProfile = null;
  let posts = null;

  if (users.length > 0) {
    const [userProf] = users;

    userProfile = userProf;

    let { data: supaPosts } = await supaClient
      .from("posts")
      .select("*")
      .like("username", username)
      .is("published", true);

    posts = supaPosts;
  }

  return {
    props: { userProfile, posts }, // will be passed as props to the component
  };
}

function UserProfilePage({ userProfile, posts }) {
  return (
    <>
      <UserProfile user={userProfile}></UserProfile>
      <div className="mx-0 lg:mx-3">
        <PostFeed posts={posts}></PostFeed>
      </div>
    </>
  );
}

export default UserProfilePage;
