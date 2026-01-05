import { FormattedMessage } from 'react-intl';
import { useFavorites } from '../lib/product/use-favorites';
import { useEffect, useState } from 'react';
import { useSession } from '../lib/use-session';

interface FavoriteButtonProps {
  productId: string;
  className?: string;
}

export default function FavoriteButton({ productId, className = '' }: FavoriteButtonProps) {
  const { session } = useSession();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [isLiked, setIsLiked] = useState(false);

  // Update the liked state when the session or productId changes
  useEffect(() => {
    if (session?.user && productId) {
      setIsLiked(isFavorite(productId));
    }
  }, [session, productId, isFavorite]);

  const handleToggleFavorite = () => {
    if (!session?.user) return;
    
    if (isLiked) {
      removeFavorite(productId);
    } else {
      addFavorite(productId);
    }
    setIsLiked(!isLiked);
  };

  const baseClasses = "w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] dark:text-blog-black p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125";
  const colorClasses = isLiked ? 'bg-red-500' : 'bg-fun-blue-300';

  return (
    <button
      onClick={handleToggleFavorite}
      className={`${baseClasses} ${colorClasses} ${className}`}
      aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
      disabled={!session?.user}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>

      <span className="sr-only">
        {isLiked ? (
          <FormattedMessage
            id="favorite-button-remove"
            description="Screen reader text for remove from favorites action"
            defaultMessage="Remove from favorites"
          />
        ) : (
          <FormattedMessage
            id="favorite-button-add"
            description="Screen reader text for add to favorites action"
            defaultMessage="Add to favorites"
          />
        )}
      </span>
    </button>
  );
}
