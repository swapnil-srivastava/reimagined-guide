import { useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { TypeAnimation } from 'react-type-animation';
import type { GetServerSideProps, NextPage } from 'next';

// Components 
import Loader from "../components/Loader";
import PostList from "../components/PostList";
import HorizontalScrollTech from "../components/HorizontalScrollTech";
import TagFilterBar, { toggleTag, useTagFilter } from "../components/TagFilterBar";

// Library
import Metatags from "../components/Metatags";
import { supaClient } from "../supa-client";
import { TAG_COUNT } from "../database.types";
import {
  POST_WITH_TAGS,
  fetchPostsByTags,
  fetchTagCounts,
  parseTagQuery,
} from "../lib/tags";

// Max post to query per page
const LIMIT = 4;

type HomeProps = { posts: POST_WITH_TAGS[]; tags: TAG_COUNT[] };

// `?tags=java,frontend` shows only posts that have every selected tag
export const getServerSideProps: GetServerSideProps<HomeProps> = async (context) => {
  const selected = parseTagQuery(context.query.tags);
  const [posts, tags] = await Promise.all([
    fetchPostsByTags(supaClient, { tags: selected, limit: LIMIT }),
    fetchTagCounts(supaClient),
  ]);

  return {
    props: { posts, tags }, // will be passed to the page component as props
  };
}

const Home: NextPage<HomeProps> = ({ posts: initialPosts, tags }) => {
  // Note: add the data in props.posts for reflecting in local development use an array and then object of post inside it.
  const [posts, setPosts] = useState<POST_WITH_TAGS[]>(initialPosts);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useTagFilter();
  const intl = useIntl();

  const translatedString1 = intl.formatMessage({ id: 'animation.string1',  description:"an Engineer", defaultMessage:"an Engineer"});
  const translatedString2 = intl.formatMessage({ id: 'animation.string2',  description:"a Frontend Engineer", defaultMessage:"a Frontend Engineer"});
  const translatedString3 = intl.formatMessage({ id: 'animation.string3',  description:"a Backend Engineer", defaultMessage:"a Backend Engineer"});
  const translatedString4 = intl.formatMessage({ id: 'animation.string4',  description:"a Full Stack Engineer", defaultMessage:"a Full Stack Engineer"});
  const translatedString5 = intl.formatMessage({ id: 'animation.string5',  description:"a Tech Lead", defaultMessage:"a Tech Lead"});
  const translatedString6 = intl.formatMessage({ id: 'animation.string6',  description:"an Architect", defaultMessage:"an Architect"});
  const translatedString7 = intl.formatMessage({ id: 'animation.string7',  description:"a Solutions Architect", defaultMessage:"a Solutions Architect"});

  const [postsEnd, setPostsEnd] = useState(initialPosts.length < LIMIT);

  // The server rendered the first page for the tags in the URL; load again
  // when the selection changes (chip clicks, back and forward buttons).
  const selectionKey = selectedTags.join(",");
  const loadedKey = useRef(selectionKey);
  const requestId = useRef(0);

  useEffect(() => {
    if (loadedKey.current === selectionKey) return;
    loadedKey.current = selectionKey;
    const id = ++requestId.current;

    setLoading(true);
    fetchPostsByTags(supaClient, { tags: selectedTags, limit: LIMIT }).then((firstPage) => {
      // Ignore answers to a selection the reader already changed
      if (id !== requestId.current) return;
      setPosts(firstPage);
      setPostsEnd(firstPage.length < LIMIT);
      setLoading(false);
    });
  }, [selectionKey]);

  const getMorePosts = async () => {
    const last = posts[posts.length - 1];
    if (!last) return;

    const id = ++requestId.current;
    setLoading(true);

    const olderPosts = await fetchPostsByTags(supaClient, {
      tags: selectedTags,
      before: last.created_at,
      limit: LIMIT,
    });
    if (id !== requestId.current) return;

    setPosts(posts.concat(olderPosts));
    setLoading(false);

    if (olderPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  };

  const onTagToggle = (slug: string) => setSelectedTags(toggleTag(selectedTags, slug));

  return (
    <main>
      <Metatags />

      {/* Block Quote */}
      <div className="p-3 flex justify-center items-center h-screen">
        <blockquote className="lg:text-9xl text-5xl font-roboto text-center font-bold text-slate-90 dark:text-blog-white text-blog-black">
          <FormattedMessage
            id="swapnil_architect_hello"
            description="an" // Description should be a string literal
            defaultMessage="Hi, I'm" // Message should be a string literal
          />{" "}
          <span className="before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-pink-500 relative inline-block mx-2 dark:text-blog-white text-blog-white">
            <span className="relative text-white">
              <FormattedMessage
                id="swapnil_name"
                description="Name of the Author" // Description should be a string literal
                defaultMessage="Swapnil Srivastava" // Message should be a string literal
              />
            </span>
          </span>
          <br />
          <span>
            <span className="underline decoration-fun-blue-500 dark:decoration-hit-pink-500 underline-offset-auto">
              <TypeAnimation
                sequence={[
                  // Same substring at the start will only be typed out once, initially
                  translatedString1,
                  1000, // wait 1s before replacing "Mice" with "Hamsters"
                  translatedString2,
                  1000,
                  translatedString3,
                  1000,
                  translatedString4,
                  1000,
                  translatedString5,
                  1000,
                  translatedString6,
                  1000,
                  translatedString7,
                  1000
                ]}
                wrapper="span"
                speed={50}
                style={{ display: 'inline-block'}}
                repeat={Infinity}
              />
            </span>
          </span>
        </blockquote>
      </div>

      {/* Text before list of technolgies */}
      <div className="lg:text-xl text-sm flex justify-center text-center bg-blog-white mt-4 pt-4 [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]">
          <p className="font-poppins font-thin">
          <FormattedMessage
                id="main_tagline"
                description="the tagline on above the horizontal scroll" // Description should be a string literal
                defaultMessage="TECHNOLOGIES ... WHICH BUILD MY CHARACTER" // Message should be a string literal
              />
          </p>
      </div>

      {/* Technolgies Forward Linear Animation*/}
      <div className="bg-blog-white p-5 w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]">
        <HorizontalScrollTech />
      </div>
    
      {/* Technolgies Forward Linear Animation Reverse */}
      <div className="bg-blog-white p-5 mb-5 w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]">
        <HorizontalScrollTech reverse={true} />
      </div>

      {/* Section before blog post --- Write.. Code.. */}
      <div className="flex flex-col justify-center items-center h-screen text-center dark:text-blog-white px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-poppins leading-tight">
          <FormattedMessage
            id="secondary_tagline"
            description="Secondary tagline on mainpage" // Description should be a string literal
            defaultMessage="WRITE .. CODE .. POST .. SLEEP .. REPEAT" // Message should be a string literal
          />
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-thin mt-4 max-w-4xl">
          <FormattedMessage
            id="secondary_tagline_description"
            description="Secondary tagline description on mainpage" // Description should be a string literal
            defaultMessage="Writing the article ... coding the code ... posting the article ... finally sleeping ... and the cycle repeats" // Message should be a string literal
          />  
        </p>
      </div>

      {/* Section before blog post --- CRACK DEBUGGER INNOVATE PERSISTANCE HARDWORK LEADER*/}
      <div className="flex flex-col text-[var(--text-primary)] overflow-clip lg:text-[150px] text-[160px] min-[320px]:text-[130px] min-[390px]:text-[150px] leading-none">

        {/* Horizontal Text-1 Linear */}
        <div className="quote-wrap gap-1">
          <div className="quote-section gap-1 animate-infinite-scroll">
            <div className="uppercase font-poppins">
              <FormattedMessage
                id="horizatal-one-tag-one-solid"
                description="Horizontal Text-1 Linear one" // Description should be a string literal
                defaultMessage="Crack Debugger" // Message should be a string literal
              />  
            </div>
            <div className="uppercase font-poppins text-stroke-outline">              
              <FormattedMessage
                id="horizatal-one-tag-two-outline"
                description="Horizontal Text-1 Linear two" // Description should be a string literal
                defaultMessage="Crack Debugger" // Message should be a string literal
              />
            </div>
          </div>
          <div className="quote-section gap-1 animate-infinite-scroll">
            <div className="uppercase font-poppins">
              <FormattedMessage
                id="horizatal-one-tag-three-solid"
                description="Horizontal Text-1 Linear three" // Description should be a string literal
                defaultMessage="Crack Debugger" // Message should be a string literal
              />
            </div>
            <div className="uppercase font-poppins text-stroke-outline">
              <FormattedMessage
                id="horizatal-one-tag-four-outline"
                description="Horizontal Text-1 Linear four" // Description should be a string literal
                defaultMessage="Crack Debugger" // Message should be a string literal
              />
            </div>
          </div>
          <div className="quote-section gap-1 animate-infinite-scroll">
            <div className="uppercase font-poppins">
            <FormattedMessage
                id="horizatal-one-tag-five-solid"
                description="Horizontal Text-1 Linear five" // Description should be a string literal
                defaultMessage="Crack Debugger" // Message should be a string literal
              />
            </div>
            <div className="uppercase font-poppins text-stroke-outline">
            <FormattedMessage
                id="horizatal-one-tag-six-outline"
                description="Horizontal Text-1 Linear six" // Description should be a string literal
                defaultMessage="Crack Debugger" // Message should be a string literal
              />
            </div>
          </div>
        </div>

        {/* Horizontal Text-2 Linear */}
        <div className="quote-wrap gap-1">
          <div className="quote-section gap-1 animate-infinite-reverse">
            <div className="uppercase font-poppins">
              <FormattedMessage
                id="horizatal-two-tag-one-solid"
                description="Horizontal Text-2 Linear one" // Description should be a string literal
                defaultMessage="Innovate" // Message should be a string literal
              />  
            </div>
            <div className="uppercase font-poppins text-stroke-outline">
              <FormattedMessage
                id="horizatal-two-tag-two-outline"
                description="Horizontal Text-2 Linear two" // Description should be a string literal
                defaultMessage="Innovate" // Message should be a string literal
              />
            </div>
          </div>
          <div className="quote-section gap-1 animate-infinite-reverse">
            <div className="uppercase font-poppins">
              <FormattedMessage
                id="horizatal-two-tag-three-solid"
                description="Horizontal Text-2 Linear three" // Description should be a string literal
                defaultMessage="Innovate" // Message should be a string literal
              />
            </div>
            <div className="uppercase font-poppins text-stroke-outline">
              <FormattedMessage
                id="horizatal-two-tag-four-outline"
                description="Horizontal Text-2 Linear four" // Description should be a string literal
                defaultMessage="Innovate" // Message should be a string literal
              />
            </div>
          </div>
          <div className="quote-section gap-1 animate-infinite-reverse">
            <div className="uppercase font-poppins">
            <FormattedMessage
                id="horizatal-two-tag-five-solid"
                description="Horizontal Text-2 Linear five" // Description should be a string literal
                defaultMessage="Innovate" // Message should be a string literal
              />
            </div>
            <div className="uppercase font-poppins text-stroke-outline">
              <FormattedMessage
                id="horizatal-two-tag-six-outline"
                description="Horizontal Text-2 Linear six" // Description should be a string literal
                defaultMessage="Innovate" // Message should be a string literal
              />
            </div>
          </div>
        </div>

        {/* Horizontal Text-3 Linear */}
        <div className="quote-wrap gap-1">
          <div className="quote-section gap-1 animate-infinite-scroll">
            <div className="uppercase font-poppins">
              <FormattedMessage
                id="horizatal-three-tag-one-solid"
                description="Horizontal Text-3 Linear one" // Description should be a string literal
                defaultMessage="Persistance" // Message should be a string literal
              />
            </div>
            <div className="uppercase font-poppins text-stroke-outline">
              <FormattedMessage
                id="horizatal-three-tag-two-outline"
                description="Horizontal Text-3 Linear two" // Description should be a string literal
                defaultMessage="Persistance" // Message should be a string literal
              />
            </div>
          </div>
          <div className="quote-section gap-1 animate-infinite-scroll">
            <div className="uppercase font-poppins">
              <FormattedMessage
                id="horizatal-three-tag-three-solid"
                description="Horizontal Text-3 Linear three" // Description should be a string literal
                defaultMessage="Persistance" // Message should be a string literal
              />
            </div>
            <div className="uppercase font-poppins text-stroke-outline">
              <FormattedMessage
                id="horizatal-three-tag-four-outline"
                description="Horizontal Text-3 Linear four" // Description should be a string literal
                defaultMessage="Persistance" // Message should be a string literal
              />
            </div>
          </div>
          <div className="quote-section gap-1 animate-infinite-scroll">
            <div className="uppercase font-poppins">
              <FormattedMessage
                id="horizatal-three-tag-five-solid"
                description="Horizontal Text-3 Linear five" // Description should be a string literal
                defaultMessage="Persistance" // Message should be a string literal
              />
            </div>
            <div className="uppercase font-poppins text-stroke-outline">
              <FormattedMessage
                id="horizatal-three-tag-six-outline"
                description="Horizontal Text-3 Linear six" // Description should be a string literal
                defaultMessage="Persistance" // Message should be a string literal
              />
            </div>
          </div>
        </div>

        {/* Horizontal Text-4 Linear */}
        <div className="quote-wrap gap-1">
          <div className="quote-section gap-1 animate-infinite-reverse">
            <div className="uppercase font-poppins">              
              <FormattedMessage
                id="horizatal-four-tag-one-solid"
                description="Horizontal Text-4 Linear one" // Description should be a string literal
                defaultMessage="Hardwork" // Message should be a string literal
              />
            </div>
            <div className="uppercase font-poppins text-stroke-outline">
              <FormattedMessage
                id="horizatal-four-tag-two-outline"
                description="Horizontal Text-4 Linear two" // Description should be a string literal
                defaultMessage="Hardwork" // Message should be a string literal
              />
            </div>
          </div>
          <div className="quote-section gap-1 animate-infinite-reverse">
            <div className="uppercase font-poppins">
              <FormattedMessage
                id="horizatal-four-tag-three-solid"
                description="Horizontal Text-4 Linear three" // Description should be a string literal
                defaultMessage="Hardwork" // Message should be a string literal
              />
            </div>
            <div className="uppercase font-poppins text-stroke-outline">
              <FormattedMessage
                id="horizatal-four-tag-four-outline"
                description="Horizontal Text-4 Linear four" // Description should be a string literal
                defaultMessage="Hardwork" // Message should be a string literal
              />
            </div>
          </div>
          <div className="quote-section gap-1 animate-infinite-reverse">
            <div className="uppercase font-poppins">
              <FormattedMessage
                id="horizatal-four-tag-five-solid"
                description="Horizontal Text-4 Linear five" // Description should be a string literal
                defaultMessage="Hardwork" // Message should be a string literal
              />
            </div>
            <div className="uppercase font-poppins text-stroke-outline">
              <FormattedMessage
                id="horizatal-four-tag-six-outline"
                description="Horizontal Text-4 Linear six" // Description should be a string literal
                defaultMessage="Hardwork" // Message should be a string literal
              />
            </div>
          </div>
        </div>

        {/* Horizontal Text-5 Linear */}
        <div className="quote-wrap gap-1">
          <div className="quote-section gap-1 animate-infinite-scroll">
            <div className="uppercase font-poppins">
              <FormattedMessage
                id="horizatal-five-tag-one-solid"
                description="Horizontal Text-5 Linear one" // Description should be a string literal
                defaultMessage="Leader" // Message should be a string literal
              />
            </div>
            <div className="uppercase font-poppins text-stroke-outline">
              <FormattedMessage
                id="horizatal-five-tag-two-outline"
                description="Horizontal Text-5 Linear two" // Description should be a string literal
                defaultMessage="Leader" // Message should be a string literal
              />
            </div>
          </div>
          <div className="quote-section gap-1 animate-infinite-scroll">
            <div className="uppercase font-poppins">
              <FormattedMessage
                id="horizatal-five-tag-three-solid"
                description="Horizontal Text-5 Linear three" // Description should be a string literal
                defaultMessage="Leader" // Message should be a string literal
              />
            </div>
            <div className="uppercase font-poppins text-stroke-outline">
              <FormattedMessage
                id="horizatal-five-tag-four-outline"
                description="Horizontal Text-5 Linear four" // Description should be a string literal
                defaultMessage="Leader" // Message should be a string literal
              />
            </div>
          </div>
          <div className="quote-section gap-1 animate-infinite-scroll">
            <div className="uppercase font-poppins">
              <FormattedMessage
                id="horizatal-five-tag-five-solid"
                description="Horizontal Text-5 Linear five" // Description should be a string literal
                defaultMessage="Leader" // Message should be a string literal
              />
            </div>
            <div className="uppercase font-poppins text-stroke-outline">
              <FormattedMessage
                id="horizatal-five-tag-six-solid"
                description="Horizontal Text-5 Linear six" // Description should be a string literal
                defaultMessage="Leader" // Message should be a string literal
              />
            </div>
          </div>
        </div>

      </div>
      
      {/* Post Feed with Title */}
      <div className="min-h-screen flex flex-col justify-start items-center pt-16 px-4">
        {/* Section title --- Unveiling the Secrets: Dive into my latest article*/}
        <h2 className="font-poppins text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-center dark:text-blog-white max-w-4xl leading-tight mb-8">
          <FormattedMessage
            id="main-title-post"
            description="main page title for before the post" // Description should be a string literal
            defaultMessage="Unveiling the Secrets: Dive into my latest article" // Message should be a string literal
          />
        </h2>
        
        {/* Topic filter */}
        <TagFilterBar
          tags={tags}
          selected={selectedTags}
          onChange={setSelectedTags}
          resultCount={posts.length}
          loading={loading}
        />

        {/* Post List */}
        <div
          id="post-list"
          // Linked from the tag pages; keeps the list clear of the fixed navbar
          style={{ scrollMarginTop: "6rem" }}
          aria-busy={loading || undefined}
          className={`flex flex-wrap gap-5 flex-1 w-full justify-center transition-opacity ${loading ? "opacity-60" : ""}`}
        >
          {posts.length > 0 ? (
            <PostList
              posts={posts}
              loading={loading}
              postsEnd={postsEnd}
              enableLoadMore={true}
              selectedTags={selectedTags}
              onTagToggle={onTagToggle}
            />
          ) : (
            !loading && selectedTags.length > 0 && (
              <div className="font-poppins flex flex-col items-center gap-3 py-12 text-center dark:text-blog-white">
                <p className="text-lg">
                  <FormattedMessage
                    id="home-no-posts-for-tags"
                    description="Shown when no article has all of the selected topics"
                    defaultMessage="No articles cover all of these topics yet. Remove a topic or show all articles."
                  />
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedTags([])}
                  className="font-poppins px-4 py-2 rounded-lg font-medium bg-[var(--color-primary-deep)] text-[var(--text-on-primary)] hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                >
                  <FormattedMessage
                    id="home-show-all-posts"
                    description="Button that clears the topic filter"
                    defaultMessage="Show all articles"
                  />
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Loading spinner */}
      <div className="flex items-center justify-center">
        <Loader show={loading} />
      </div>

      {/* Load more */}
      {!loading && !postsEnd && posts.length > 0 && (
        <div className="flex items-center justify-center py-6">
          <button
            type="button"
            onClick={getMorePosts}
            className="font-poppins px-5 py-2.5 rounded-lg font-medium bg-[var(--color-primary-deep)] text-[var(--text-on-primary)] hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
          >
            <FormattedMessage
              id="load_more_button"
              description="Load More"
              defaultMessage="Load More"
            />
          </button>
        </div>
      )}

      {/* End of Post Text */}
      {postsEnd && posts.length > 0 && (
        <div className="flex items-center justify-center dark:text-blog-white">
          <FormattedMessage
            id="end_of_articles"
            description="End of articles" // Description should be a string literal
            defaultMessage="End of articles" // Message should be a string literal
          />
        </div>
      )}

    </main>
  );
};

export default Home;
