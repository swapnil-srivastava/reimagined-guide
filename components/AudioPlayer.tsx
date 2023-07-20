import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faBackward,
  faForward,
  faPause,
  faPlay,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";

import BasicTooltip from "./Tooltip";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  function togglePlayPause() {
    setIsPlaying(!isPlaying);
  }

  return (
    <>
      <div className="flex flex-row justify-center items-center gap-1 dark:bg-slate-900 dark:text-white ring-1 ring-black/5 dark:ring-white/10 shadow-lg p-2 rounded-lg">
        <audio src="/tadaa.mp3">
          Your browser does not support the audio element.
        </audio>
        <button className="flex flex-row items-center">
          <BasicTooltip title={"Backwards 5 seconds"} placement="bottom">
            <div className="bg-fun-blue-300 dark:text-blog-black w-[calc(3rem_*_0.5)] h-[calc(3rem_*_0.5)] rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125">
              <div className="flex flex-row items-center">
                <FontAwesomeIcon icon={faBackward} size="xs" />
              </div>
            </div>
          </BasicTooltip>
        </button>
        <button className="flex flex-row gap-1 items-center">
          <BasicTooltip title={"Forward 5 seconds"} placement="bottom">
            <div className="bg-fun-blue-300 dark:text-blog-black w-[calc(3rem_*_0.5)] h-[calc(3rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125">
              <FontAwesomeIcon icon={faForward} size="xs" />
            </div>
          </BasicTooltip>
        </button>
        <button
          className="flex flex-row gap-1 items-center"
          onClick={() => togglePlayPause()}
        >
          <BasicTooltip title={"Play or Pause"} placement="bottom">
            <div className="bg-fun-blue-300 dark:text-blog-black w-[calc(3rem_*_0.5)] h-[calc(3rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125">
              {isPlaying ? (
                <FontAwesomeIcon icon={faPause} size="xs" />
              ) : (
                <FontAwesomeIcon icon={faPlay} size="xs" />
              )}
            </div>
          </BasicTooltip>
        </button>
        <div className="flex flex-row items-center gap-1">
          <div className="text-sm">0.00</div>
          <div className="flex flex-row items-center">
            <input type="range"></input>
          </div>
          <div className="text-sm">4.00</div>
        </div>
        <button className="flex flex-row gap-1 items-center">
          <BasicTooltip title={"mute"} placement="bottom">
            <div className="bg-fun-blue-300 dark:text-blog-black w-[calc(3rem_*_0.5)] h-[calc(3rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125">
              <FontAwesomeIcon icon={faVolumeXmark} size="xs" />
            </div>
          </BasicTooltip>
        </button>
      </div>
    </>
  );
}
