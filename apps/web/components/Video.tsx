import React from "react";

const Video = ({ videoSrc }) => {
  return (
    <>
      {videoSrc && (
        <iframe
          className="w-full aspect-video"
          src={videoSrc}
          title="YouTube Video Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      )}
    </>
  );
};

export default Video;
