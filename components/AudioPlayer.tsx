import { useEffect, useRef, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faBackward,
  faForward,
  faPause,
  faPlay,
  faVolumeHigh,
  faVolumeLow,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Slider } from "@mui/material";

import BasicTooltip from "./Tooltip";

interface AudioPlayerProps {
  audioSource: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSource }) => {
  // state of play or pause
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // state of duration
  const [duration, setDuration] = useState(0);

  // state of current time
  const [currentTime, setCurrentTime] = useState<number>(0);

  // State of volume
  const [volumeLevel, setVolumeLevel] = useState<number>(0);

  // Audio Player Ref
  const audioPlayer = useRef();

  // State of mute
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    // Setting the duration of the audio file
    setDuration((audioPlayer?.current as HTMLAudioElement).duration);

    // Setting the current time of the Audio file
    setCurrentTime((audioPlayer?.current as HTMLAudioElement).currentTime);

    // Setting the volume
    setVolumeLevel((audioPlayer?.current as HTMLAudioElement).volume * 100);

    (audioPlayer?.current as HTMLAudioElement)?.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    return () => {
      (audioPlayer?.current as HTMLAudioElement)?.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );
    };
  }, [
    (audioPlayer?.current as HTMLAudioElement)?.onloadedmetadata,
    (audioPlayer?.current as HTMLAudioElement)?.readyState,
  ]);

  function calculateTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const returnedMins = mins < 10 ? `0${mins}` : `${mins}`;
    const secs = Math.floor(seconds % 60);
    const returnedSecs = secs < 10 ? `0${secs}` : `${secs}`;
    return `${returnedMins}:${returnedSecs}`;
  }

  function forward5Seconds() {
    if (audioPlayer.current as HTMLAudioElement) {
      const newTime = Math.min(
        (audioPlayer.current as HTMLAudioElement).currentTime + 5,
        duration
      );
      (audioPlayer.current as HTMLAudioElement).currentTime = newTime;
      setCurrentTime(newTime);
    }
  }

  function backward5Seconds() {
    if ((audioPlayer.current as HTMLAudioElement).currentTime) {
      const newTime = Math.max(
        (audioPlayer.current as HTMLAudioElement).currentTime - 5,
        0
      );
      (audioPlayer.current as HTMLAudioElement).currentTime = newTime;
      setCurrentTime(newTime);
    }
  }

  function togglePlayPause() {
    if (audioPlayer.current) {
      if (!isPlaying) {
        const playPromise = (audioPlayer.current as HTMLAudioElement).play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
              console.error("Playback error:", error);
            });
        }
      } else {
        (audioPlayer.current as HTMLAudioElement).pause();
        setIsPlaying(false);
      }
    }
  }

  function handleVolumeChange(e: Event) {
    setVolumeLevel(parseFloat((e.target as HTMLButtonElement).value));
    if (audioPlayer && audioPlayer.current) {
      (audioPlayer.current as HTMLAudioElement).volume =
        parseFloat((e.target as HTMLButtonElement).value) / 100;
    }
  }

  function handleTimeUpdate(e) {
    if (audioPlayer && audioPlayer.current) {
      setCurrentTime((audioPlayer?.current as HTMLAudioElement).currentTime);
    }
  }

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    if (audioPlayer && audioPlayer.current) {
      const newTime = (newValue as number) * (duration / 100);
      (audioPlayer.current as HTMLAudioElement).currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (audioPlayer && audioPlayer.current) {
      (audioPlayer.current as HTMLAudioElement).muted = !(
        audioPlayer.current as HTMLAudioElement
      ).muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      <div className="flex flex-col dark:bg-slate-900 dark:text-white ring-1 ring-black/5 dark:ring-white/10 shadow-lg p-4 rounded-lg">
        {/* Forward 5 second // Backward 5 second // Play/Pause // currentTime // Progress Slider // Duration // Mute */}
        <div className="flex flex-row justify-center items-center gap-2">
          {/* Audio Player */}
          <audio ref={audioPlayer} src={audioSource}>
            Your browser does not support the audio element.
          </audio>

          {/* Backwards 5 Seconds */}
          <button
            className="flex flex-row items-center"
            onClick={() => backward5Seconds()}
          >
            <BasicTooltip title={"Backwards 5 seconds"} placement="bottom">
              <div className="bg-fun-blue-300 dark:text-blog-black w-[calc(5rem_*_0.5)] h-[calc(5rem_*_0.5)] rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125">
                <div className="flex flex-row items-center">
                  <FontAwesomeIcon icon={faBackward} size="lg" />
                </div>
              </div>
            </BasicTooltip>
          </button>

          {/* Forward 5 Seconds */}
          <button
            className="flex flex-row gap-1 items-center"
            onClick={() => forward5Seconds()}
          >
            <BasicTooltip title={"Forward 5 seconds"} placement="bottom">
              <div className="bg-fun-blue-300 dark:text-blog-black w-[calc(5rem_*_0.5)] h-[calc(5rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125">
                <FontAwesomeIcon icon={faForward} size="lg" />
              </div>
            </BasicTooltip>
          </button>

          {/* Play or Pause */}
          <button
            className="flex flex-row gap-1 items-center"
            onClick={() => togglePlayPause()}
          >
            <div className="bg-fun-blue-300 dark:text-blog-black w-[calc(5rem_*_0.5)] h-[calc(5rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125">
              {isPlaying ? (
                <FontAwesomeIcon icon={faPause} size="lg" />
              ) : (
                <FontAwesomeIcon icon={faPlay} size="lg" />
              )}
            </div>
          </button>

          <div className="flex flex-row items-center gap-2">
            {/* Current time */}
            <div className="text-sm">{calculateTime(currentTime)}</div>
            {/* Progress Bar */}
            <div className="flex flex-row items-center w-20 ml-1">
              <Slider
                aria-label="Volume"
                value={(currentTime / duration) * 100}
                onChange={(e, newValue) => handleSliderChange(e, newValue)}
              />
            </div>
            {/* Duration */}
            <div className="text-sm ml-1">
              {duration && !isNaN(duration) && calculateTime(duration)}
            </div>
          </div>

          {/* Mute button */}
          <button
            className="flex flex-row gap-1 items-center"
            onClick={() => toggleMute()}
          >
            <BasicTooltip
              title={isMuted ? "Unmute" : "Mute"}
              placement="bottom"
            >
              <div className="bg-fun-blue-300 dark:text-blog-black w-[calc(5rem_*_0.5)] h-[calc(5rem_*_0.5)] p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125">
                {isMuted ? (
                  <FontAwesomeIcon icon={faVolumeHigh} size="lg" />
                ) : (
                  <FontAwesomeIcon icon={faVolumeXmark} size="lg" />
                )}
              </div>
            </BasicTooltip>
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex flex-row items-center gap-2 mt-2">
          <div className="flex flex-row items-center mr-2">
            <FontAwesomeIcon icon={faVolumeLow} size="lg" />
          </div>
          <Slider
            aria-label="Volume"
            value={volumeLevel}
            onChange={(e) => handleVolumeChange(e)}
          />
          <div className="flex flex-row items-center ml-2">
            <FontAwesomeIcon icon={faVolumeHigh} size="lg" />
          </div>
        </div>
      </div>
    </>
  );
};

export default AudioPlayer;
