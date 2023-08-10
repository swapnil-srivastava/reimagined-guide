// Audio Uploader is exactly similar to ImageUploader // TODO: need to reformat it based on usage

import { useState } from "react";
import { supaClient } from "../supa-client";
import Loader from "./Loader";

export default function AudioUploader() {
  const [uploading, setUploading] = useState(false);
  const [progress] = useState<String>("");
  const [downloadURL] = useState(null);

  // Creates a Supabase Upload Task
  const uploadFile = async (e) => {
    const target = e.target as HTMLInputElement;
    // Get the file
    const file: File = Array.from(target.files)[0];
    if (!file) return;

    const extension = file.type.split("/")[1];

    setUploading(true);
    const { data, error } = await supaClient.storage
      .from("audio")
      .upload("audio_1", file);

    setUploading(false);

    console.log("data after upload", data);

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

    // TODO: Set the URL of the Audio file to be traced and shown to the user
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

      {downloadURL && (
        <code className="upload-snippet">{`![alt](${downloadURL})`}</code>
      )}
    </div>
  );
}
