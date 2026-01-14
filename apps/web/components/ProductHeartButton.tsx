import { useState, useEffect } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import toast from "react-hot-toast";
import { PRODUCT } from "../database.types";
import { supaClient } from "../supa-client";
import { useSelector } from "react-redux";
import { RootState } from "../lib/interfaces/interface";

interface HeartButtonProps {
  product: PRODUCT;
}

// Allows user to heart/like a product or add to favorites
export default function HeartButton({ product }: HeartButtonProps) {
  const intl = useIntl();
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile } = userInfo;
  
  // Check if the product is already in favorites when component loads
  useEffect(() => {
    console.log('ProductHeartButton - Profile info:', {
      hasProfile: !!profile,
      profileId: profile?.id,
      productId: product?.id
    });
    
    async function checkFavoriteStatus() {
      if (!profile || !product?.id) {
        console.log('ProductHeartButton - Missing profile or product ID');
        return;
      }
      
      try {
        console.log('ProductHeartButton - Checking favorite status with:', {
          product_id: product.id,
          user_id: profile.id
        });
        
        const { data, error } = await supaClient
          .from('favorites')
          .select('*')
          .eq('product_id', product.id)
          .eq('user_id', profile.id)
          .single();
        
        console.log('ProductHeartButton - Favorite check result:', { data, error });
        
        if (!error && data) {
          setLiked(true);
        } else {
          setLiked(false);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      } finally {
        setInitialized(true);
      }
    }
    
    checkFavoriteStatus();
  }, [product?.id, profile?.id]);

  const toggleFavorite = async () => {
    console.log('ProductHeartButton - Toggle favorite called with:', {
      hasProfile: !!profile,
      profileId: profile?.id,
      productId: product?.id
    });
    
    if (!profile) {
      // User not logged in, show toast
      toast.error(
        intl.formatMessage({
          id: "heart-button-login-required",
          description: "Login required message",
          defaultMessage: "Please log in to save products to favorites"
        }),
        { duration: 4000 }
      );
      return;
    }
    
    if (!product?.id) {
      console.error("No product ID available");
      return;
    }
    
    // Optimistic UI update - toggle the state immediately for better UX
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLoading(true);
    
    try {
      // Check if product is already favorited
      if (wasLiked) {
        console.log('ProductHeartButton - Removing from favorites:', {
          product_id: product.id,
          user_id: profile.id
        });
        
        // Remove from favorites
        const { error } = await supaClient
          .from('favorites')
          .delete()
          .eq('product_id', product.id)
          .eq('user_id', profile.id);
          
        if (error) throw error;
        
        toast.success(
          intl.formatMessage({
            id: "heart-button-removed-from-favorites",
            description: "Removed from favorites message",
            defaultMessage: "Removed from favorites"
          }),
          { 
            position: 'bottom-center',
            duration: 2000 
          }
        );
      } else {
        console.log('ProductHeartButton - Adding to favorites:', {
          product_id: product.id,
          user_id: profile.id
        });
        
        // Add to favorites
        const { data, error } = await supaClient
          .from('favorites')
          .insert([
            { product_id: product.id, user_id: profile.id }
          ])
          .select(); // Add .select() to return the inserted data
          
        console.log('ProductHeartButton - Insert result:', { data, error });
          
        if (error) throw error;
        
        toast.success(
          intl.formatMessage({
            id: "heart-button-added-to-favorites",
            description: "Added to favorites message",
            defaultMessage: "Added to favorites"
          }),
          { 
            position: 'bottom-center',
            duration: 2000 
          }
        );
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert the optimistic update if there's an error
      setLiked(wasLiked);
      
      toast.error(
        intl.formatMessage({
          id: "heart-button-error",
          description: "Error message",
          defaultMessage: "Something went wrong. Please try again."
        }),
        { duration: 4000 }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite();
      }}
      disabled={loading || !initialized}
      className={`w-10 h-10 flex items-center justify-center rounded-full ${
        liked 
          ? "bg-hit-pink-50 dark:bg-hit-pink-900/20 text-hit-pink-500" 
          : "bg-white dark:bg-fun-blue-700 text-gray-400 dark:text-blog-white"
      } shadow-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-hit-pink-300 focus:ring-offset-2 ${
        loading ? "animate-pulse" : ""
      } ${!initialized ? "opacity-50" : "opacity-100"}`}
      aria-label={
        liked
          ? intl.formatMessage({
              id: "heart-button-remove-from-favorites",
              description: "Remove from favorites button label",
              defaultMessage: "Remove from favorites"
            })
          : intl.formatMessage({
              id: "heart-button-add-to-favorites", 
              description: "Add to favorites button label",
              defaultMessage: "Add to favorites"
            })
      }
    >
      <FontAwesomeIcon
        icon={liked ? faHeart : faHeartRegular}
        className={`w-5 h-5 ${
          liked ? "text-hit-pink-500 dark:text-hit-pink-400" : "text-gray-500 dark:text-blog-white"
        } transition-colors ${loading ? "opacity-70" : ""}`}
      />
    </button>
  );
}
