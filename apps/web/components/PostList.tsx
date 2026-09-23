'use client';

import Link from "next/link";
import { FormattedMessage } from "react-intl";
import moment from "moment";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import type { POST } from "../database.types";

interface PostListProps {
    posts: POST[];
    loading?: boolean;
    postsEnd?: boolean;
    enableLoadMore?: boolean;
}

// Plain-text preview of the markdown body for the card excerpt
function generateExcerpt(markdown?: string | null) {
    if (!markdown) return "";
    return markdown
        .replace(/```[\s\S]*?```/g, " ")          // code blocks
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")     // images
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")   // links -> link text
        .replace(/<[^>]+>/g, " ")                 // html tags
        .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "") // headings, quotes, list markers
        .replace(/[*_~`]/g, "")                   // emphasis and inline code
        .replace(/\s+/g, " ")
        .trim();
}

// Post list to be used only with homepage
const PostList: React.FC<PostListProps> = ({ posts, loading = false, postsEnd = false, enableLoadMore = false }) => {

    return posts ? posts.map((post) => {
        const wordCount = post?.content.trim().split(/\s+/g).length;
        const minutesToRead = (wordCount / 100 + 1).toFixed(0);
        const excerpt = generateExcerpt(post?.content);
        const initial = (post?.title?.trim()?.[0] ?? "").toUpperCase();
        const dateFormat = moment(post.created_at).isValid()
          ? moment(post.created_at).format("DD MMM YYYY")
          : moment(post.created_at?.toMillis()).format("DD MMM YYYY");

        return (
            <Link
                key={post.slug}
                className="group flex py-2 lg:py-6 w-full sm:w-72 rounded-2xl focus:outline-none"
                href={`/${post.username}/${post.slug}`}
            >
                <article className="flex flex-col w-full mx-3 lg:mx-0 overflow-hidden rounded-2xl font-poppins bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-focus-visible:ring-2 group-focus-visible:ring-[var(--color-primary)]">
                    {/* Cover: grows to fill the card's height on desktop */}
                    <div className="relative flex-1 min-h-[9rem] overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-deeper)]">
                        <div aria-hidden="true" className="absolute inset-0 opacity-20 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:18px_18px]" />
                        <span
                            aria-hidden="true"
                            className="absolute -bottom-8 -right-1 text-[10rem] leading-none font-bold text-white/15 select-none transition-transform duration-500 group-hover:scale-110"
                        >
                            {initial}
                        </span>
                        <span className="absolute top-4 left-4 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                            {minutesToRead}{" "}
                            <FormattedMessage
                                id="postfeed-min-read"
                                description="min read"
                                defaultMessage="min read"
                            />
                        </span>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col gap-3 p-5">
                        {/* Published date */}
                        <p className="flex gap-1 text-xs uppercase tracking-wider text-[var(--text-muted)]">
                            <FormattedMessage
                                id="post-list-published"
                                description="Published" // Description should be a string literal
                                defaultMessage="Published" // Message should be a string literal
                            />
                            <span aria-hidden="true">·</span>
                            <time dateTime={post.created_at ?? undefined}>{dateFormat}</time>
                        </p>

                        {/* Post Title */}
                        <h3 className="text-xl font-semibold leading-snug line-clamp-2 min-h-[3.5rem] underline-offset-4 decoration-2 decoration-[var(--color-primary)] group-hover:underline">
                            {post.title}
                        </h3>

                        {/* Excerpt */}
                        {excerpt && (
                            <p className="text-sm leading-relaxed text-[var(--text-muted)] line-clamp-3">
                                {excerpt}
                            </p>
                        )}

                        {/* Author and Read More */}
                        <div className="mt-1 flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
                            <div className="flex items-center gap-2 min-w-0">
                                {post?.photo_url ? (
                                    <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden">
                                        <Image width={64} height={64} src={post.photo_url} alt="" />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold text-[var(--text-on-primary)] bg-[var(--color-primary-deep)]">
                                        {post.username?.[0]?.toUpperCase()}
                                    </div>
                                )}
                                <span className="text-sm font-medium truncate">{post.username}</span>
                            </div>

                            <span className="flex shrink-0 items-center gap-2 text-sm font-medium">
                                <FormattedMessage
                                    id="post-list-read-more"
                                    description="Read more" // Description should be a string literal
                                    defaultMessage="Read more" // Message should be a string literal
                                />
                                <span className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-on-primary)] bg-[var(--color-primary-deep)] transition-transform duration-300 group-hover:translate-x-1">
                                    <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                                </span>
                            </span>
                        </div>
                    </div>
                </article>
            </Link>
        );
    })
    : <FormattedMessage
        id="posts_list_end"
        description="Posts List End" // Description should be a string literal
        defaultMessage="No more articles" // Message should be a string literal
    />
 }

export default PostList;
