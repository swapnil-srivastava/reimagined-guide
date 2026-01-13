import { useEffect } from "react";
import SpotifyPlayer from "../components/SpotifyPlayer";
import { FormattedMessage } from "react-intl";

function Play() {
  return (
    <div className="min-h-screen pt-20 pb-10 px-4 bg-blog-white dark:bg-fun-blue-500 transition-colors duration-300">
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
  );
}

export default Play;
