// Audio Uploader is exactly similar to ImageUploader // TODO: need to reformat it based on usage

import { useState } from "react";
import { useSelector } from "react-redux";

import { supaClient } from "../supa-client";
import Loader from "./Loader";

// Root Interface
import { RootState } from "../lib/interfaces/interface";

export default function AudioUploader({ getAudioFileName }) {
  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);

  console.log("user", userInfo);

  const [uploading, setUploading] = useState(false);
  const [progress] = useState<String>("");
  const [downloadURL, setDownloadURL] = useState(null);

  // Creates a Supabase Upload Task
  const uploadFile = async (e: { target: HTMLInputElement }) => {
    const target = e.target as HTMLInputElement;
    // Get the file
    const selectedFile = Array.from(target.files)[0];
    if (!selectedFile) return;
    if (selectedFile) {
      const fileNameWithExtension = selectedFile.name;
      const fileNameWithoutExtension: string = fileNameWithExtension.replace(
        /\.[^/.]+$/,
        ""
      );

      const extension = selectedFile.type.split("/")[1];

      setUploading(true); // Show Loader

      if (userInfo.profile.id) {
        // Note: cannot upload duplicate file
        // file.name = adding the file with prefix "audio_{filename}"
        const { data, error } = await supaClient.storage
          .from("audio")
          .upload(
            `${userInfo?.profile?.id}/${fileNameWithExtension}`,
            selectedFile,
            {
              cacheControl: "3600",
              upsert: false,
            }
          );

        setUploading(false); // Hide Loader

        // TODO: calculate the percentage if you get something in return

        // example code of calculating percentage
        // ======================================
        // Listen to updates to upload task
        // task.on(STATE_CHANGED, (snapshot) => {
        //   const pct: String = (
        //     (snapshot.bytesTransferred / snapshot.totalBytes) *
        //     100
        //   ).toFixed(0);
        //   setProgress(pct);

        getAudioFileName(`${userInfo?.profile?.id}/${fileNameWithExtension}`); // Calling parent function to access the file name and add it to the database
      } else {
        setUploading(false); // Hide Loader
      }
    }
  };

  return (
    <div>
      <Loader show={uploading} />
      {uploading && <h3>{progress}</h3>}

      {!uploading && (
        <>
          {/*         
          <label htmlFor="audio-upload" className="block p-1">
            Audio Upload <span className="sr-only">Choose Audio</span>
            <input
              type="file"
              id="audio-upload"
              onChange={uploadFile}
              accept="audio/mpeg,audio/wav"
              className="block w-full
                text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-hit-pink-500 file:text-blog-black
                transition-filter duration-500 hover:filter hover:brightness-125
                "
            />
          </label> */}

          {/* Option 3  */}
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">
                    Click to upload audio file{" "}
                  </span>
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  MPEG WAV MP3
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                onChange={uploadFile}
                accept="audio/mpeg,audio/wav"
                className="hidden"
              />
            </label>
          </div>
        </>
      )}
    </div>
  );
}
