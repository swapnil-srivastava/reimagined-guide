interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  user_id: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: Product; // Make products optional since it might not always be joined
}

// For creating a new favorite
export interface CreateFavoriteDTO {
  product_id: string;
}

// Once you've created the favorites table in your database and updated your types,
// you can uncomment this line and use the proper type
// export type FavoriteRow = Database['public']['Tables']['favorites']['Row'];
