import { useEffect } from "react";
import type { NextPage } from 'next';
import SpotifyPlayer from "../components/SpotifyPlayer";
import { FormattedMessage } from "react-intl";

const Play: NextPage = () => {
  return (
    <main className="text-blog-black dark:text-blog-white">
      <div className="font-poppins min-h-screen pt-20 pb-10 px-4 bg-blog-white dark:bg-fun-blue-500 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8 text-blog-black dark:text-blog-white">
                <FormattedMessage 
                    id="play-page-title" 
                    defaultMessage="Music & Podcasts" 
                    description="Title for the play page"
                />
            </h1>
            <SpotifyPlayer uri="spotify:playlist:37i9dQZF1DXcBWIGoYBM5M" />
        </div>
      </div>
    </main>
  );
}

export default Play;
