import { FormattedMessage } from "react-intl";
import { faHeart, faPenToSquare, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import BasicTooltip from "./Tooltip";
import { POST } from "../database.types";

import { supaClient } from "../supa-client";

// Allows user to heart or like a post
export default function Heart({ post, userId }) {

  // emotion_type TEXT, -- e.g., 'like', 'dislike', 'heart', 'clap'
  async function toggleEmotion(postId: string, userId: string, emotionType: string = 'heart') {
    // Check if the user has already expressed this emotion
    const { data: existingEmotion } = await supaClient
      .from('emotions')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('emotion_type', emotionType)
      .single();
  
    if (existingEmotion) {
      // Remove emotion
      await supaClient
        .from('emotions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('emotion_type', emotionType);
    } else {
      // Add emotion
      await supaClient
        .from('emotions')
        .insert({ post_id: postId, user_id: userId, emotion_type: emotionType });
    }
  
    // Update emotion counts
    const { count: likeCount } = await supaClient
      .from('emotions')
      .select('*', { count: 'exact' })
      .eq('post_id', postId)
      .eq('emotion_type', 'like');
  
    const { count: dislikeCount } = await supaClient
      .from('emotions')
      .select('*', { count: 'exact' })
      .eq('post_id', postId)
      .eq('emotion_type', 'dislike');
  
    const { count: heartCount } = await supaClient
      .from('emotions')
      .select('*', { count: 'exact' })
      .eq('post_id', postId)
      .eq('emotion_type', 'heart');
  
    const { count: clapCount } = await supaClient
      .from('emotions')
      .select('*', { count: 'exact' })
      .eq('post_id', postId)
      .eq('emotion_type', 'clap');
  
    await supaClient
      .from('posts')
      .update({
        like_count: likeCount,
        dislike_count: dislikeCount,
        heart_count: heartCount,
        clap_count: clapCount,
      })
      .eq('id', postId);
  
    return {
      like_count: likeCount,
      dislike_count: dislikeCount,
      heart_count: heartCount,
      clap_count: clapCount,
    };
  }

  return true ? (
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
          onClick={() => toggleEmotion(post, userId)}
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
  ) : <></>
}
