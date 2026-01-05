import type { NextApiRequest, NextApiResponse } from 'next';
import { supaClient } from '../../supa-client';
import { supaServerClient } from '../../supa-server-client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('=== FAVORITES API REQUEST ===');
    console.log('Method:', req.method);
    console.log('Service client available:', !!supaServerClient);
    
    // Get the user from the request
    const authHeader = req.headers.authorization;
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.log('No authorization header');
      return res.status(401).json({ message: 'No authorization header' });
    }
    
    const token = authHeader.split(' ')[1] || '';
    console.log('Token extracted, length:', token.length);
    
    // Verify user authentication using regular client
    const { data: { user }, error: authError } = await supaClient.auth.getUser(token);
    
    if (authError) {
      console.log('Auth error:', authError);
      return res.status(401).json({ message: 'Authentication error', error: authError.message });
    }
    
    if (!user) {
      console.log('No user found after auth');
      return res.status(401).json({ message: 'Unauthorized - no user' });
    }

    console.log('User authenticated:', user.id);
    
    const userId = user.id;

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return getFavorites(userId, res, req);
      case 'POST':
        return addFavorite(userId, req, res);
      case 'DELETE':
        return removeFavorite(userId, req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Get all favorites for a user
async function getFavorites(userId: string, res: NextApiResponse, req: NextApiRequest) {
  try {
    console.log('Getting favorites for user:', userId);
    
    // Get pagination and sorting params from query
    const { page = '1', limit = '12', sortBy = 'created_at', order = 'desc' } = req.query;
    
    console.log('Query params:', { page, limit, sortBy, order });
    
    // Convert to numbers
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    
    // Calculate range for pagination
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;
    
    console.log('Pagination range:', { from, to });
    
    // Use server client if available (bypasses RLS), otherwise fall back to regular client
    const clientToUse = supaServerClient || supaClient;
    const isUsingServerClient = !!supaServerClient;
    
    console.log('Using server client (bypasses RLS):', isUsingServerClient);
    
    // Use the chosen client to get favorites for the authenticated user
    const { count, error: countError } = await clientToUse
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (countError) {
      console.error('Count error:', countError);
      throw countError;
    }
    
    console.log('Total favorites count:', count);
    
    // Fetch favorites with product data
    const { data, error } = await clientToUse
      .from('favorites')
      .select(`
        id,
        user_id,
        product_id,
        created_at,
        products!inner (
          id,
          name,
          description,
          price,
          stock,
          image_url,
          user_id,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order(sortBy as string, { ascending: order === 'asc' })
      .range(from, to);
    
    if (error) {
      console.error('Favorites fetch error:', error);
      throw error;
    }
    
    console.log('Found favorites:', data?.length || 0);
    console.log('Favorites data sample:', data?.[0] || 'none');
    
    return res.status(200).json({
      favorites: data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
      debug: {
        usedServerClient: isUsingServerClient,
        userId,
        queryParams: { page, limit, sortBy, order }
      }
    });
  } catch (error) {
    console.error('Error getting favorites:', error);
    return res.status(500).json({ 
      message: 'Error fetching favorites', 
      error: error.message,
      favorites: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 }
    });
  }
}

// Add a product to user's favorites
async function addFavorite(userId: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    console.log('Adding favorite:', { userId, productId });
    
    // Use server client if available (bypasses RLS), otherwise fall back to regular client
    const clientToUse = supaServerClient || supaClient;
    const isUsingServerClient = !!supaServerClient;
    
    console.log('Adding favorite using server client (bypasses RLS):', isUsingServerClient);
    
    // Insert the favorite
    const { data, error } = await clientToUse
      .from('favorites')
      .insert([
        {
          user_id: userId,
          product_id: productId,
        },
      ])
      .select();
    
    if (error) {
      console.error('Add favorite error:', error);
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ message: 'Product already in favorites' });
      }
      throw error;
    }
    
    console.log('Favorite added successfully:', data);
    return res.status(201).json({ 
      message: 'Added to favorites', 
      favorite: data[0],
      debug: {
        usedServerClient: isUsingServerClient,
        userId,
        productId
      }
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return res.status(500).json({ message: 'Error adding to favorites', error: error.message });
  }
}

// Remove a product from user's favorites
async function removeFavorite(userId: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    console.log('Removing favorite:', { userId, productId });
    
    // Use server client if available (bypasses RLS), otherwise fall back to regular client
    const clientToUse = supaServerClient || supaClient;
    const isUsingServerClient = !!supaServerClient;
    
    console.log('Removing favorite using server client (bypasses RLS):', isUsingServerClient);
    
    // Delete the favorite
    const { data, error } = await clientToUse
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)
      .select();
    
    if (error) {
      console.error('Remove favorite error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    
    console.log('Favorite removed successfully:', data);
    return res.status(200).json({ 
      message: 'Removed from favorites', 
      favorite: data[0],
      debug: {
        usedServerClient: isUsingServerClient,
        userId,
        productId
      }
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return res.status(500).json({ message: 'Error removing from favorites', error: error.message });
  }
}
