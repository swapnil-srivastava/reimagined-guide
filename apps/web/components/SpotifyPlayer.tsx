import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useTheme } from 'next-themes';
import { FormattedMessage } from 'react-intl';

interface SpotifyPlayerProps {
  uri?: string;
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ uri = 'spotify:playlist:37i9dQZF1DXcBWIGoYBM5M' }) => {
  const { resolvedTheme } = useTheme();
  const elementRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initPlayer = (IFrameAPI: any) => {
        const element = elementRef.current;
        if (!element) return;
        
        const options = {
          uri: uri,
          width: '100%',
          height: '100%',
          theme: resolvedTheme === 'dark' ? 'dark' : 'light',
        };
        const callback = (EmbedController: any) => {
            // Optional: Handle events
        };
        IFrameAPI.createController(element, options, callback);
        setIsLoaded(true);
    };

    if ((window as any).IFrameAPI) {
        initPlayer((window as any).IFrameAPI);
    } else {
        window.onSpotifyIframeApiReady = initPlayer;
    }
  }, [uri, resolvedTheme]);

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className={`relative w-full h-[152px] rounded-xl overflow-hidden shadow-xl ${resolvedTheme === 'dark' ? 'shadow-fun-blue-900/20' : 'shadow-gray-200'} transition-shadow duration-300`}>
         {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse">
              <span className="text-gray-400">
                <FormattedMessage 
                  id="spotify-loading" 
                  defaultMessage="Loading Spotify..." 
                  description="Loading state text for Spotify player"
                />
              </span>
            </div>
         )}
         <div ref={elementRef} className="w-full h-full" />
      </div>
      <Script 
        src="https://open.spotify.com/embed/iframe-api/v1" 
        strategy="lazyOnload"
      />
    </div>
  );
};

export default SpotifyPlayer;
