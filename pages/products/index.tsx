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
  }, [searchTerm, sortBy, filterCategory, intl]);

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-blog-white dark:bg-fun-blue-600 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="font-poppins text-4xl md:text-5xl lg:text-6xl font-bold dark:text-blog-white text-blog-black mb-4">
                <FormattedMessage
                  id="products-heading"
                  description="Products"
                  defaultMessage="Our Products"
                />
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                <FormattedMessage
                  id="products-subtitle"
                  description="Discover our amazing collection"
                  defaultMessage="Discover our amazing collection of carefully curated products"
                />
              </p>
            </div>
          </div>
        </div>

        {/* Cart Notification */}
        {cartItems && cartItems.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faShoppingCart} className="text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <FormattedMessage
                        id="product-index-cart-ready"
                        description="Ready to checkout"
                        defaultMessage="Ready to checkout when you are"
                      />
                    </p>
                  </div>
                </div>
                <Link href="/cart">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
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
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter Bar */}
          <div className="bg-blog-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={intl.formatMessage({
                    id: "products-search-placeholder",
                    description: "Search products",
                    defaultMessage: "Search products..."
                  })}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Sort and Filter */}
              <div className="flex gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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

            {/* Results Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
            </div>
          </div>

          {/* Products Grid */}
          <ProductCard products={products} loading={loadProducts} postsEnd={false} enableLoadMore={true} />
        </div>
      </div>
    </>
  );
}

export default Products;