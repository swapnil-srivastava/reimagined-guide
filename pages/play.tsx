import Script from "next/script";
import { useEffect } from "react";
import AudioPlayer from "../components/AudioPlayer";

interface windowObj {
  onSpotifyIframeApiReady: any;
}

function Play() {
  useEffect(() => {
    spotifyController();
  }, []);

  const spotifyController = () => {
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      let element = document.getElementById("embed-iframe");
      let options = {
        width: "100%",
        height: "300",
        uri: "spotify:episode:7makk4oTQel546B0PZlDM5",
      };
      let callback = (EmbedController) => {};
      IFrameAPI.createController(element, options, callback);
    };
  };

  return (
    <>
      <div className="flex items-center p-5 first:bg-dark-blue-900">
        <Script
          src="https://open.spotify.com/embed-podcast/iframe-api/v1"
          strategy="lazyOnload"
        />
        <div id="embed-iframe"></div>
      </div>

      <div className="max-w-lg mx-auto p-8">
        <details
          className="open:bg-white dark:open:bg-slate-900 open:ring-1 open:ring-black/5 dark:open:ring-white/10 open:shadow-lg p-6 rounded-lg"
          open
        >
          <summary className="text-sm leading-6 text-slate-900 dark:text-white font-semibold select-none">
            Why do they call it Ovaltine?
          </summary>
          <div className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            <p>
              The mug is round. The jar is round. They should call it Roundtine.
            </p>
          </div>
        </details>
      </div>

      <div className="flex justify-center">
        <AudioPlayer></AudioPlayer>
      </div>
    </>
  );
}

export default Play;
