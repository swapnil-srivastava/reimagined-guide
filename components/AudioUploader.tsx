// Audio Uploader is exactly similar to ImageUploader // TODO: need to reformat it based on usage

import { useState } from "react";
import { supaClient } from "../supa-client";
import Loader from "./Loader";

export default function AudioUploader({ getAudioFileName }) {
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

      // Note: cannot upload duplicate file
      // file.name = adding the file with prefix "audio_{filename}"
      const { data, error } = await supaClient.storage
        .from("audio")
        .upload(fileNameWithoutExtension, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

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

      getAudioFileName(fileNameWithoutExtension); // Calling parent function to access the file name and add it to the database
    }
  };

  return (
    <div className="">
      <Loader show={uploading} />
      {uploading && <h3>{progress}%</h3>}

      {!uploading && (
        <>
          <label htmlFor="audio-upload" className="block p-1">
            <span className="sr-only">Choose Audio</span>
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
          </label>
        </>
      )}
    </div>
  );
}
