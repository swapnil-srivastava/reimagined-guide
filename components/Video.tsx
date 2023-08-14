import React from "react";

const Video = () => {
  return (
    <>
      <iframe
        className="w-full aspect-video"
        src="https://www.youtube.com/embed/VcnROkRhJ34?si=XWwW27TetPSNbSQg"
        title="YouTube Video Player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </>
  );
};

export default Video;
