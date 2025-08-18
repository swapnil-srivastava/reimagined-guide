import { useState } from "react";
import { FormattedMessage } from 'react-intl';
import Loader from "./Loader";

export default function ImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [progress] = useState<String>("");
  const [downloadURL] = useState(null);

  // Creates a Supabase Upload Task
  const uploadFile = async (e) => {
    const target = e.target as HTMLInputElement;
    // Get the file
    const file: File = Array.from(target.files)[0];
    const extension = file.type.split("/")[1];

    setUploading(true);
  };

  return (
    <div className="box">
      <Loader show={uploading} />
      {uploading && <h3>{progress}%</h3>}

      {!uploading && (
        <>
          <label htmlFor="image-upload" className="block p-1">
            <span className="sr-only">
              <FormattedMessage
                id="imageuploader-choose-image-sr"
                description="Choose Image"
                defaultMessage="Choose Image"
              />
            </span>
            <input
              type="file"
              id="image-upload"
              onChange={uploadFile}
              accept="image/x-png,image/gif,image/jpeg"
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
