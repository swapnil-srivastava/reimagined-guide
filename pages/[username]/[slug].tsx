import styles from '../../styles/Post.module.css';
import React from 'react';
import { useSelector } from 'react-redux';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { firestore, getUserWithUsername, postToJSON } from '../../lib/firebase';
import PostContent from '../../components/PostContent';
import Metatags from '../../components/Metatags';
import AuthCheck from '../../components/AuthCheck';
import Link from 'next/link';
import HeartButton from '../../components/HeartButton';

interface RootState {
  counter: Object
  users: UserState,
}

interface UserState {
  user: User,
  username: any
}

interface User {
  uid: String
}

// e.g. localhost:3000/swapnil/page1
// e.g. localhost:3000/swapnil/page2

export async function getStaticProps({ params }) {
  const { username, slug } = params;
  const userDoc = await getUserWithUsername(username);

  let post;
  let path;

  if (userDoc) {
    const postRef = userDoc.ref.collection('posts').doc(slug);
    post = postToJSON(await postRef.get());

    path = postRef.path;
  }

  return {
    props: { post, path },
    revalidate: 5000,
  };

}

export async function getStaticPaths() {
  // Improve my using Admin SDK to select empty docs
  const snapshot = await firestore.collectionGroup('posts').get();

  const paths = snapshot.docs.map((doc) => {
    const { slug, username } = doc.data();
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
    fallback: 'blocking',
  };
}

function Post(props) {
  const postRef : any = firestore.doc(props.path);

  const [realtimePost] = useDocumentData(postRef);


  const post = realtimePost || props.post;


  // TS infers type: (state: RootState) => boolean
  const selectUser = (state: RootState) => state.users; 
  const { user: currentUser, username } = useSelector(selectUser);
  // const { user: currentUser } = useContext(UserContext);

  function generateMetaDescription(input) {
    if (input.length > 100) {
      return input.substring(0, 100) + '...';
   }
   return input;
  }

  return (
    <main className={styles.container}>
      <Metatags title={post.title} description={generateMetaDescription(post.content)} />

      <section>
        <PostContent post={post} />
      </section>

      <aside className="card dark:bg-fun-blue-500 dark:text-blog-white">
        <p>
          <strong>{post.heartCount || 0} 🤍</strong>
        </p>

        <AuthCheck
          fallback={
            <Link href="/enter">
              <button className='bg-hit-pink-500 text-blog-black'>💗 Sign Up</button>
            </Link>
          }
        >
          <HeartButton postRef={postRef} />
        </AuthCheck> 

         {currentUser?.uid === post.uid && (
          <Link href={`/admin/${post.slug}`}>
            <button className="bg-hit-pink-500 text-blog-black">Edit Post</button>
          </Link>
        )}


      </aside>

    </main>
  )
}

export default Post