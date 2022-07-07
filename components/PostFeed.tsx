import React from 'react';
import Link from 'next/link';
import { auth } from '../lib/firebase';

export function PostFeed({posts, admin = false}) {
  return posts ? posts.map(post => <PostItem post={post} key={post.slug} admin={post && post.uid === auth.currentUser?.uid ? true : false}/>) : '';
}

function PostItem({post, admin = false}) {
    const wordCount = post?.content.trim().split(/\s+/g).length;
    const minutesToRead = (wordCount / 100 + 1).toFixed(0);

    return (
        <>
          <div className="
                p-3 my-4 mx-4 
                bg-blog-white 
                dark:bg-fun-blue-600 dark:text-blog-white
                rounded-lg
                drop-shadow-lg
                hover:drop-shadow-xl
                ">
            <Link href={`/${post.username}`}>
                <a>
                    <strong>By @{post.username}</strong>
                </a>
            </Link>

            <Link href={`/${post.username}/${post.slug}`}>
                <h2>
                    <a>{post.title}</a>
                </h2>
            </Link>

            <footer>
                <span>
                    {wordCount} words. {minutesToRead} min read
                </span>
                <span>💗 {post.heartCount || 0} Hearts</span>
            </footer>

            {/* If admin view, show extra controls for user */}
            {admin && (
                <>
                <Link href={`/admin/${post.slug}`}>
                    <h3>
                    <button className="bg-hit-pink-500 text-blog-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                    </button>
                    </h3>
                </Link>

                {post.published ? <p className="text-success">Live</p> : <p className="text-danger">Unpublished</p>}
                </>
            )}
            </div>
        </>
    );
};

export default PostFeed;
