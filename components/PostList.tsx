'use client';

import Link from "next/link";
import { FormattedMessage } from "react-intl";
import moment from "moment";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

// Post list to be used only with homepage
const PostList = ({  posts,  loading = false, postsEnd = false, enableLoadMore = false }) => {
    
    function generateContent(input) {
        if (!input) return;
        if (input.length > 25) {
            return input.substring(0, 25) + "...";
        }
            return input;
    }  

    return posts ? posts.map((post, index, array) => {
        const wordCount = post?.content.trim().split(/\s+/g).length;
        const contentTrimmed = generateContent(post?.content);
        const titleTrimmed = generateContent(post?.title);
        const minutesToRead = (wordCount / 100 + 1).toFixed(0);
        const dateFormat = moment(post.created_at).isValid()
          ? moment(post.created_at).format("DD MMM YYYY")
          : moment(post.created_at?.toMillis()).format("DD MMM YYYY");

        return (<>
            {!loading &&
            !postsEnd &&
            enableLoadMore && (
                <>
                    <Link className="flex py-24 hover:py-14 min-w-fit" href={`/${post.username}/${post.slug}`} key={post.slug}>
                        <div className="p-4 hover:px-8 flex lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                            <div className="flex flex-col gap-2 justify-between">
                                {/* DATE and Author */}
                                <div>
                                    {/* author image and author name */}
                                    <div className="flex items-center gap-2">
                                        {/* Author Image */}
                                        <Link href={`/${post.username}`} legacyBehavior>
                                            {post?.photo_url && post?.photo_url ? (
                                                <div className="w-12 h-12 rounded-full cursor-pointer flex items-center overflow-hidden">
                                                <Image
                                                    width={200}
                                                    height={200}
                                                    src={post.photo_url}
                                                    alt=""
                                                />
                                                </div>
                                            ) : (
                                                <div className="text-base font-thin">{` ${post.username}`}</div>
                                            )}
                                        </Link>

                                        {/* DATE Div */}
                                        <div className="flex gap-1 self-start">
                                            {/* Author Name */}
                                            <div className="self-start">{` ${post.username}`}</div>                                      
                                        </div>
                                    </div>
                                </div>

                                {/* Post Title */}
                                <div className="text-2xl font-semibold flex flex-col" >
                                    <Link href={`/${post.username}/${post.slug}`} >
                                        {titleTrimmed}
                                    </Link>
                                    <div className="flex gap-2 text-xs self-end font-thin">
                                        <div>Published</div>
                                        <div>{dateFormat}</div>
                                    </div>
                                </div>

                                {/* Read More */}
                                <div className="text-xl flex items-center gap-2">
                                    <Link href={`/${post.username}/${post.slug}`} >
                                        <p className="font-thin">Read more</p>
                                    </Link>
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </div>
                            </div>
                        </div>
                    </Link>
                </>
            )}
        </>
        )}
      )
    : <FormattedMessage
        id="posts_list_end"
        description="Posts List End" // Description should be a string literal
        defaultMessage="No more articles" // Message should be a string literal 
    />
 }

export default PostList;