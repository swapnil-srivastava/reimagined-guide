import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { faHeart, faPenToSquare, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
          <FontAwesomeIcon icon={faHeart} />
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
          {/* for adding heart */}
          <FontAwesomeIcon icon={faHeart} /> 
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
