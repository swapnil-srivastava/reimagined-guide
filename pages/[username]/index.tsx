import React from 'react';
import PostFeed from '../../components/PostFeed';
import UserProfile from '../../components/UserProfile';
import { getUserWithUsername, postToJSON } from '../../lib/firebase';

// e.g. localhost:3000/swapnil
// e.g. localhost:3000/ria
export async function getServerSideProps({query}) {
  const { username } = query;

  const userDoc = await getUserWithUsername(username);

  // If no user, short circuit to 404 page
  if (!userDoc) {
    return {
      notFound: true,
    };
  }
  
  // JSON serializable data
  let user = null;
  let posts = null;

  if (userDoc) {
    user = userDoc.data();
    const postsQuery = userDoc.ref
      .collection('posts')
      .where('published', '==', true)
      .orderBy('createdAt', 'desc')

    posts = (await postsQuery.get()).docs.map(postToJSON);
    
  }

  return {
    props: {user, posts}, // will be passed as props to the component
  }
}

function UserProfilePage({user, posts}) {
  return (
    <>
      <UserProfile user={user}></UserProfile>
      <PostFeed posts={posts} admin enableLoadMore={false}></PostFeed>
    </>
  )
}

export default UserProfilePage