import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSession } from '../../lib/use-session';
import ProductCardWithFavorites from '../../components/ProductCardWithFavorites';
import Loader from '../../components/Loader';
import ProductSkeletonGrid from '../../components/ProductSkeletonGrid';
import AuthCheck from '../../components/AuthCheck';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faHeart } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  created_at: string;
}

interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products: Product;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface FavoritesResponse {
  favorites: Favorite[];
  pagination: PaginationMeta;
}

export default function FavoritesPage() {
  const { session } = useSession();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 0,
  });
  const intl = useIntl();

  // Fetch favorites with pagination
  const fetchFavorites = async (page = 1) => {
    if (!session?.access_token) {
      console.log('No access token available');
      return;
    }

    try {
      setIsLoading(true);
      
      const url = `/api/favorites?page=${page}&limit=${pagination.limit}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }
      
      const data: FavoritesResponse = await response.json();
      setFavorites(data.favorites);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]); // Reset to empty array on error
      toast.error(
        intl.formatMessage({
          id: 'favorites-fetch-error',
          description: 'Error message when favorites fail to load',
          defaultMessage: 'Failed to load favorites'
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchFavorites(pagination.page);
    }
  }, [session]);

  // Function to handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchFavorites(newPage);
  };

  // Remove a favorite
  const handleRemoveFavorite = async (productId: string) => {
    if (!session?.access_token) return;
    
    try {
      const response = await fetch(`/api/favorites?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Update the UI by removing the item
      setFavorites(favorites.filter(fav => fav.product_id !== productId));
      setPagination({
        ...pagination,
        total: pagination.total - 1
      });
      
      toast.success(
        intl.formatMessage({
          id: 'favorites-remove-success',
          description: 'Success message when removing from favorites',
          defaultMessage: 'Removed from favorites'
        })
      );
      
      // If we've removed the last item on this page and it's not the first page, go to previous page
      if (favorites.length === 1 && pagination.page > 1) {
        fetchFavorites(pagination.page - 1);
      } else if (favorites.length === 1) {
        // If it's the last item on the first page, just refresh
        fetchFavorites(1);
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error(
        intl.formatMessage({
          id: 'favorites-remove-error',
          description: 'Error message when removing from favorites fails',
          defaultMessage: 'Failed to remove from favorites'
        })
      );
    }
  };

  // If user is not logged in, show auth check
  if (!session) {
    return <AuthCheck />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-blog-white dark:bg-fun-blue-500">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blog-black dark:text-blog-white">
            <FormattedMessage
              id="favorites-page-title"
              description="Title for the favorites page"
              defaultMessage="My Favorite Products"
            />
          </h1>
        </div>

        {isLoading ? (
          <ProductSkeletonGrid />
        ) : (favorites && Array.isArray(favorites) && favorites.length > 0) ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favorites.map(favorite => {
                // Check if products is an array (Supabase sometimes returns arrays for joins)
                const productData = Array.isArray(favorite.products) 
                  ? favorite.products[0]  // Take first item if it's an array
                  : favorite.products;    // Use as is if it's an object
                
                return (
                <ProductCardWithFavorites 
                  key={favorite.id} 
                  product={productData}
                  showFavoriteButton={true}
                  onFavoriteToggle={() => handleRemoveFavorite(favorite.product_id)}
                />
                );
              })}
            </div>
            
            {/* Pagination controls */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-fun-blue-600 text-gray-700 dark:text-gray-300 transition-colors hover:bg-hit-pink-100 dark:hover:bg-fun-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  
                  <div className="flex space-x-2">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      // Show pages around the current page
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            pageNum === pagination.page
                              ? 'bg-hit-pink-500 text-white'
                              : 'bg-gray-100 dark:bg-fun-blue-600 text-gray-700 dark:text-gray-300 hover:bg-hit-pink-100 dark:hover:bg-fun-blue-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-fun-blue-600 text-gray-700 dark:text-gray-300 transition-colors hover:bg-hit-pink-100 dark:hover:bg-fun-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-blog-black dark:text-blog-white mb-6">
              <FormattedMessage
                id="favorites-empty-message"
                description="Message shown when user has no favorite products"
                defaultMessage="You haven't added any products to your favorites yet."
              />
            </p>
            <a 
              href="/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-hit-pink-500 to-hit-pink-600 hover:from-hit-pink-600 hover:to-hit-pink-700 text-white rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-hit-pink-400 focus:ring-offset-2 shadow-sm"
            >
              <FormattedMessage
                id="favorites-browse-products-button"
                description="Button to browse products when favorites is empty"
                defaultMessage="Browse Products"
              />
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
