import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { faHeart, faPenToSquare, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import BasicTooltip from "./Tooltip";

// Allows user to heart or like a post
export default function Heart({ postRef }) {
  // Listen to heart document for currently logged in user
  // const heartRef = postRef.collection("hearts").doc();

  const [docRefState, setDocRefState] = useState();

  useEffect(() => {}, []);

  // Create a user-to-post relationship
  const addHeart = async () => {
    const uid = "";
    const batch = "";
  };

  // Remove a user-to-post relationship
  const removeHeart = async () => {
    const batch = "";
  };

  // TODO: adding the logic
  return true ? (
    <BasicTooltip title="Not good enough" placement="bottom">
      <div className="flex items-center">
        <button
          className="bg-hit-pink-500 dark:text-blog-black px-3 py-2 mx-1 
                rounded-3xl flex items-center justify-center 
                transition-filter duration-500 hover:filter hover:brightness-125
                focus:outline-none focus:ring-2 
                focus:ring-fun-blue-400 
                focus:ring-offset-2
                font-semibold"
          onClick={removeHeart}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 stroke-1 hover:stroke-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <div className="ml-2 text-sm md:text-md font-light">
            <FormattedMessage id="heart-button-remove"
              description="text on heart button to remove" // Description should be a string literal
              defaultMessage="Remove" // Message should be a string literal
              />
          </div>
        </button>
      </div>
    </BasicTooltip>
  ) : (
    <BasicTooltip title="Do you like the post?" placement="bottom">
      <div className="flex items-center">
        <button
         className="bg-hit-pink-500 dark:text-blog-black px-3 py-2 mx-1 
                          rounded-3xl flex items-center justify-center 
                          transition-filter duration-500 hover:filter hover:brightness-125
                          focus:outline-none focus:ring-2 
                          focus:ring-fun-blue-400 
                          focus:ring-offset-2
                          font-semibold"
          onClick={addHeart}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 stroke-1 hover:stroke-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
          <div className="ml-2 text-sm md:text-md font-light">
            <FormattedMessage id="heart-button-heart"
              description="text on heart button to heart" // Description should be a string literal
              defaultMessage="Heart" // Message should be a string literal
              />
          </div>
        </button>
      </div>
    </BasicTooltip>
  );
}
