import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useSelector } from "react-redux";
import Link from "next/link";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faFilter, faSearch } from "@fortawesome/free-solid-svg-icons";

// CSS
import styles from "../../styles/Admin.module.css";

// Components
import ProductCard from "../../components/ProductCard";

// Redux
import { RootState } from "../../lib/interfaces/interface";

// Supabase
import { supaClient } from "../../supa-client";

function Products() {
  const intl = useIntl();

  const selectUser = (state: RootState) => state.cart;
  const { cartItems } = useSelector(selectUser);

  const [products, setProducts] = useState([]);
  const [loadProducts, setLoadProducts] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadProducts(true);
        let query = supaClient
          .from('products')
          .select('*');

        // Apply sorting
        if (sortBy === 'price_low') {
          query = query.order('price', { ascending: true });
        } else if (sortBy === 'price_high') {
          query = query.order('price', { ascending: false });
        } else if (sortBy === 'newest') {
          query = query.order('created_at', { ascending: false });
        } else {
          query = query.order('name', { ascending: true });
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        let filteredProducts = data || [];

        // Apply search filter
        if (searchTerm) {
          filteredProducts = filteredProducts.filter(product =>
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        // Apply category filter (temporary implementation using name/description patterns)
        if (filterCategory !== 'all') {
          filteredProducts = filteredProducts.filter(product => {
            const productText = `${product.name} ${product.description}`.toLowerCase();
            switch (filterCategory) {
              case 'electronics': 
                return productText.includes('electronic') || productText.includes('device') || 
                       productText.includes('tech') || productText.includes('digital');
              case 'clothing': 
                return productText.includes('shirt') || productText.includes('clothing') || 
                       productText.includes('apparel') || productText.includes('wear');
              case 'home': 
                return productText.includes('home') || productText.includes('garden') || 
                       productText.includes('furniture') || productText.includes('decor');
              case 'books': 
                return productText.includes('book') || productText.includes('read') || 
                       productText.includes('novel') || productText.includes('guide');
              default: return true;
            }
          });
        }

        // Apply price range filter
        if (priceRange !== 'all') {
          filteredProducts = filteredProducts.filter(product => {
            const price = product.price || 0;
            switch (priceRange) {
              case 'under-25': return price < 25;
              case '25-50': return price >= 25 && price <= 50;
              case '50-100': return price >= 50 && price <= 100;
              case 'over-100': return price > 100;
              default: return true;
            }
          });
        }

        setProducts(filteredProducts);
        
        // Only show success toast on initial load, not on filter/sort changes
        if (!searchTerm && sortBy === 'name' && filterCategory === 'all') {
          toast.success(intl.formatMessage({
            id: "products-loaded-successfully",
            description: "Products loaded successfully!",
            defaultMessage: "Products loaded successfully!"
          }));
        }
      } catch (error) {
        toast.error(intl.formatMessage({
          id: "products-error-loading",
          description: "Error loading products",
          defaultMessage: "Error loading products: {error}"
        }, { error: error.message }));
      } finally {
        setLoadProducts(false);
      }
    };

    fetchProducts();
  }, [searchTerm, sortBy, filterCategory, priceRange, intl]);

  return (
    <>
      <div className="min-h-screen bg-blog-white dark:bg-fun-blue-500">
        {/* Hero Section */}
        <div className="bg-blog-white dark:bg-fun-blue-500 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="font-poppins text-4xl md:text-5xl lg:text-6xl font-bold text-black dark:text-blog-white mb-4">
                <FormattedMessage
                  id="products-heading"
                  description="Products"
                  defaultMessage="Our Products"
                />
              </h1>
              <p className="text-lg text-gray-600 dark:text-blog-white max-w-2xl mx-auto">
                <FormattedMessage
                  id="products-subtitle"
                  description="Discover our amazing collection"
                  defaultMessage="Discover our amazing collection of carefully curated products"
                />
              </p>
            </div>
          </div>
        </div>

        {/* Cart Notification - Fixed positioning for better visibility */}
        {cartItems && cartItems.length > 0 && (
          <div className="sticky top-0 z-40 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between bg-blog-white dark:bg-fun-blue-500 rounded-lg p-4 shadow-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                    <FontAwesomeIcon icon={faShoppingCart} className="text-green-600 dark:text-green-400 text-lg" />
                  </div>
                  <div>
                    <p className="font-semibold text-black dark:text-blog-white">
                      {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                    <p className="text-sm text-gray-500 dark:text-blog-white">
                      <FormattedMessage
                        id="product-index-cart-ready"
                        description="Ready to checkout"
                        defaultMessage="Ready to checkout when you are"
                      />
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-blog-white">Total</p>
                    <p className="font-bold text-lg text-black dark:text-blog-white">
                      ${cartItems.reduce((total, item) => total + (item.price || 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <Link href="/cart">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg">
                      <FormattedMessage
                        id="product-index-cart-added-redirect-btn"
                        description="Go to cart"
                        defaultMessage="View Cart"
                      />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter Bar */}
          <div className="bg-blog-white dark:bg-fun-blue-500 rounded-lg shadow-lg dark:shadow-xl dark:shadow-black/25 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 z-10" />
                <input
                  type="text"
                  placeholder={intl.formatMessage({
                    id: "products-search-placeholder",
                    description: "Search products",
                    defaultMessage: "Search products..."
                  })}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 shadow-md dark:shadow-lg dark:shadow-black/20 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/30 focus:shadow-xl dark:focus:shadow-2xl dark:focus:shadow-black/40 transition-shadow duration-200"
                />
              </div>

              {/* Sort and Filter */}
              <div className="flex flex-wrap gap-4 items-center">
                {/* Toggle Filters Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 shadow-md dark:shadow-lg dark:shadow-black/20 hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faFilter} className="mr-2" />
                  {intl.formatMessage({ id: "products-filters", defaultMessage: "Filters" })}
                </button>
                
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-md dark:shadow-lg dark:shadow-black/20 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/30 focus:shadow-xl dark:focus:shadow-2xl dark:focus:shadow-black/40 transition-shadow duration-200 cursor-pointer"
                >
                  <option value="name">
                    {intl.formatMessage({ id: "products-sort-name", defaultMessage: "Sort by Name" })}
                  </option>
                  <option value="price_low">
                    {intl.formatMessage({ id: "products-sort-price-low", defaultMessage: "Price: Low to High" })}
                  </option>
                  <option value="price_high">
                    {intl.formatMessage({ id: "products-sort-price-high", defaultMessage: "Price: High to Low" })}
                  </option>
                  <option value="newest">
                    {intl.formatMessage({ id: "products-sort-newest", defaultMessage: "Newest First" })}
                  </option>
                </select>
              </div>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-blog-white mb-2">
                      <FormattedMessage id="products-category-label" defaultMessage="Category" />
                    </label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-md dark:shadow-lg dark:shadow-black/20 hover:shadow-lg transition-shadow duration-200"
                    >
                      <option value="all">
                        {intl.formatMessage({ id: "products-filter-all", defaultMessage: "All Categories" })}
                      </option>
                      <option value="electronics">
                        {intl.formatMessage({ id: "products-filter-electronics", defaultMessage: "Electronics" })}
                      </option>
                      <option value="clothing">
                        {intl.formatMessage({ id: "products-filter-clothing", defaultMessage: "Clothing" })}
                      </option>
                      <option value="home">
                        {intl.formatMessage({ id: "products-filter-home", defaultMessage: "Home & Garden" })}
                      </option>
                      <option value="books">
                        {intl.formatMessage({ id: "products-filter-books", defaultMessage: "Books" })}
                      </option>
                    </select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-blog-white mb-2">
                      <FormattedMessage id="products-price-range-label" defaultMessage="Price Range" />
                    </label>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-md dark:shadow-lg dark:shadow-black/20 hover:shadow-lg transition-shadow duration-200"
                    >
                      <option value="all">
                        {intl.formatMessage({ id: "products-price-all", defaultMessage: "All Prices" })}
                      </option>
                      <option value="under-25">
                        {intl.formatMessage({ id: "products-price-under-25", defaultMessage: "Under $25" })}
                      </option>
                      <option value="25-50">
                        {intl.formatMessage({ id: "products-price-25-50", defaultMessage: "$25 - $50" })}
                      </option>
                      <option value="50-100">
                        {intl.formatMessage({ id: "products-price-50-100", defaultMessage: "$50 - $100" })}
                      </option>
                      <option value="over-100">
                        {intl.formatMessage({ id: "products-price-over-100", defaultMessage: "Over $100" })}
                      </option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setFilterCategory('all');
                        setPriceRange('all');
                        setSearchTerm('');
                      }}
                      className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                    >
                      <FormattedMessage id="products-clear-filters" defaultMessage="Clear Filters" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Results Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <p className="text-sm text-gray-600 dark:text-blog-white">
                    <FormattedMessage
                      id="products-results-count"
                      description="Showing X products"
                      defaultMessage="Showing {count} {count, plural, one {product} other {products}}"
                      values={{ count: products.length }}
                    />
                    {searchTerm && (
                      <span className="ml-2">
                        <FormattedMessage
                          id="products-search-results"
                          description="for search term"
                          defaultMessage='for "{searchTerm}"'
                          values={{ searchTerm }}
                        />
                      </span>
                    )}
                  </p>
                  
                  {/* Active Filters */}
                  {(filterCategory !== 'all' || priceRange !== 'all') && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {filterCategory !== 'all' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          Category: {filterCategory}
                          <button 
                            onClick={() => setFilterCategory('all')}
                            className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {priceRange !== 'all' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Price: {priceRange.replace('-', ' - $').replace('under', 'Under $').replace('over', 'Over $')}
                          <button 
                            onClick={() => setPriceRange('all')}
                            className="ml-1 text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100"
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Stock Statistics */}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <FormattedMessage
                    id="products-in-stock"
                    description="Products in stock"
                    defaultMessage="{inStock} in stock"
                    values={{ 
                      inStock: products.filter(p => (p.stock || 0) > 0).length 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid - Proper spacing container */}
          <div className="w-full">
            <ProductCard products={products} loading={loadProducts} postsEnd={false} enableLoadMore={true} />
          </div>
        </div>

        {/* Floating Cart Button - Only visible when cart has items */}
        {cartItems && cartItems.length > 0 && (
          <Link href="/cart">
            <div className="fixed bottom-20 right-6 z-40 group">
              <button className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-green-500/25 border-2 border-white">
                <FontAwesomeIcon icon={faShoppingCart} className="text-lg" />
                {/* Cart Count Badge */}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse border border-white">
                  {cartItems.length}
                </span>
              </button>
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                <FormattedMessage
                  id="floating-cart-tooltip"
                  description="View cart tooltip"
                  defaultMessage="View Cart ({count} {count, plural, one {item} other {items}})"
                  values={{ count: cartItems.length }}
                />
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
              </div>
            </div>
          </Link>
        )}
      </div>
    </>
  );
}

export default Products;