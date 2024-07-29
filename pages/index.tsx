import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { TypeAnimation } from 'react-type-animation';

// Components 
import PostFeed from "../components/PostFeed";
import Loader from "../components/Loader";
import PostList from "../components/PostList";
import HorizontalScrollTech from "../components/HorizontalScrollTech";

// Library
import Metatags from "../components/Metatags";
import { supaClient } from "../supa-client";
import { POST } from "../database.types";

// Max post to query per page
const LIMIT = 3;

export async function getServerSideProps(context) {
  let { data: posts } = await supaClient
    .from("posts")
    .select("*")
    .is("approved", true)
    .is("published", true)
    .order("created_at", { ascending: false })
    .range(0, LIMIT);

  return {
    props: { posts }, // will be passed to the page component as props
  };
}

export default function Home(props) {
  // Note: add the data in props.posts for reflecting in local development use an array and then object of post inside it.
  const [posts, setPosts] = useState<POST[]>(props.posts);
  const [loading, setLoading] = useState<boolean>(false);

  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    setLoading(true);

    const last = posts[posts.length - 1];

    const { created_at: cursor } = last;

    let { data: oldPosts } = await supaClient
      .from("posts")
      .select("*")
      .is("published", true)
      .is("approved", true)
      .lt("created_at", cursor)
      .order("created_at", { ascending: false })
      .range(0, LIMIT);

    setPosts(posts.concat(oldPosts));

    setLoading(false);

    if (oldPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  };

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
                  'an Engineer',
                  1000, // wait 1s before replacing "Mice" with "Hamsters"
                  'a Frontend Engineer',
                  1000,
                  'a Backend Engineer',
                  1000,
                  'a Full Stack Engineer',
                  1000,
                  'a Tech Lead',
                  1000,
                  'an Architect',
                  1000,
                  'a Solutions Architect',
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
      <div className="flex flex-col justify-center items-center h-screen text-center dark:text-blog-white ">
        <h1 className="lg:text-7xl text-xl font-poppins">
          <FormattedMessage
            id="secondary_tagline"
            description="Secondary tagline on mainpage" // Description should be a string literal
            defaultMessage="WRITE .. CODE .. POST .. SLEEP .. REPEAT" // Message should be a string literal
          />
        </h1>
        <p className="lg:text-3xl text-sm font-thin">
          <FormattedMessage
            id="secondary_tagline_description"
            description="Secondary tagline description on mainpage" // Description should be a string literal
            defaultMessage="Writing the article ... coding the code ... posting the article ... finally sleeping ... and the cycle repeats" // Message should be a string literal
          />  
        </p>
      </div>

      {/* Section before blog post --- CRACK DEBUGGER INNOVATE PERSISTANCE HARDWORK LEADER*/}
      <div className="flex flex-col dark:text-blog-white overflow-clip lg:text-[150px] text-[80px] leading-none">

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
      
      {/* Section before blog post --- Unveiling the Secrets: Dive into my latest article*/}
      <div className="font-poppins lg:text-8xl text-3xl flex mt-10 justify-center text-center dark:text-blog-white">
        <FormattedMessage
          id="main-title-post"
          description="main page title for before the post" // Description should be a string literal
          defaultMessage="Unveiling the Secrets: Dive into my latest article" // Message should be a string literal
        />
      </div>

      {/* Post Feed  */}
      <div className={`h-screen flex justify-center ${posts?.length < 3 ? "" : "lg:ml-96"}`}>
        <div className="flex gap-5">
          <PostList posts={posts} loading={loading} postsEnd={postsEnd} enableLoadMore={true}/>
        </div>
      </div>

      {/* Loading spinner */}
      <div className="flex items-center justify-center">
        <Loader show={loading} />
      </div>

      {/* End of Post Text */}
      {postsEnd && (
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
}
