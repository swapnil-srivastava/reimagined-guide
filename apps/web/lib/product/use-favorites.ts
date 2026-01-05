import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { supaClient } from '../../supa-client';
import { useSession } from '../use-session';
import { Favorite } from '../interfaces/favorite.interface';
import { toast } from 'react-hot-toast';
import { Database } from '../../database.types';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useSession();
  const user = session?.user || null;
  const intl = useIntl();
  
  // Load user's favorites when component mounts
  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user, session]);

  // Load favorites from Supabase
  const loadFavorites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supaClient
        .from('favorites')
        .select(`
          *,
          products:product_id (*)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      console.log('Loaded favorites from hook:', data);
      // Cast data to Favorite[] type to avoid TypeScript issues
      setFavorites(data as unknown as Favorite[] || []);
    } catch (error) {
      toast.error(
        intl.formatMessage({
          id: 'favorites-load-error',
          description: 'Error message when favorites fail to load',
          defaultMessage: 'Failed to load favorites'
        })
      );
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add a product to favorites
  const addFavorite = async (productId: string) => {
    if (!user) {
      toast.error(
        intl.formatMessage({
          id: 'favorites-login-required',
          description: 'Error message when user tries to favorite without logging in',
          defaultMessage: 'Please log in to add favorites'
        })
      );
      return;
    }

    try {
      const { data, error } = await supaClient
        .from('favorites')
        .insert({
          user_id: user.id,
          product_id: productId
        })
        .select()
        .single();

      if (error) throw error;

      setFavorites([...favorites, data]);
      
      toast.success(
        intl.formatMessage({
          id: 'favorites-add-success',
          description: 'Success message when adding to favorites',
          defaultMessage: 'Added to favorites'
        })
      );
    } catch (error) {
      // Check if error is due to unique constraint
      if (error.code === '23505') {
        toast.error(
          intl.formatMessage({
            id: 'favorites-already-exists',
            description: 'Error message when product is already in favorites',
            defaultMessage: 'This product is already in your favorites'
          })
        );
      } else {
        toast.error(
          intl.formatMessage({
            id: 'favorites-add-error',
            description: 'Error message when adding to favorites fails',
            defaultMessage: 'Failed to add to favorites'
          })
        );
      }
      console.error('Error adding favorite:', error);
    }
  };

  // Remove a product from favorites
  const removeFavorite = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supaClient
        .from('favorites')
        .delete()
        .match({ user_id: user.id, product_id: productId });

      if (error) throw error;

      setFavorites(favorites.filter(fav => fav.product_id !== productId));
      
      toast.success(
        intl.formatMessage({
          id: 'favorites-remove-success',
          description: 'Success message when removing from favorites',
          defaultMessage: 'Removed from favorites'
        })
      );
    } catch (error) {
      toast.error(
        intl.formatMessage({
          id: 'favorites-remove-error',
          description: 'Error message when removing from favorites fails',
          defaultMessage: 'Failed to remove from favorites'
        })
      );
      console.error('Error removing favorite:', error);
    }
  };

  // Check if a product is favorited by the user
  const isFavorite = (productId: string) => {
    return favorites.some(fav => fav.product_id === productId);
  };

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    refresh: loadFavorites
  };
};
