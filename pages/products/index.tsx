import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useSelector } from "react-redux";
import Link from "next/link";
import toast from "react-hot-toast";

// CSS
import styles from "../../styles/Admin.module.css";

// Components
import ProductCard from "../../components/ProductCard";

// Redux
import { RootState } from "../../lib/interfaces/interface";

// Supabase
import { supaClient } from "../../supa-client";

function Products() {

  const selectUser = (state: RootState) => state.cart;
  const { cartItems } = useSelector(selectUser);

  const [products, setProducts] = useState([]);
  const [loadProducts, setLoadProducts] = useState<boolean>();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadProducts(true);
        const { data, error } = await supaClient
          .from('products') // Adjust the table name as needed
          .select('*');

        if (error) {
          throw error;
        }

        setProducts(data || []);
        toast.success('Products loaded successfully!');
      } catch (error) {
        toast.error(`Error loading products: ${error.message}`);
      } finally {
        setLoadProducts(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <div className="flex flex-wrap flex-col gap-4 pb-20">
        <div className="font-poppins lg:text-5xl text-3xl dark:text-blog-white text-blog-black lg:p-10 p-5 self-center">
            <FormattedMessage
                id="products-heading"
                description="Products" // Description should be a string literal
                defaultMessage="Products" // Message should be a string literal
            />
        </div>
        <div className="lg:px-14 lg:pl-20 lg:py-5 px-2 py-1 flex flex-wrap flex-row lg:gap-x-20 lg:gap-y-11 gap-y-10 md:justify-start justify-center">

          {/* if products have been added to the cart */}
          {cartItems && cartItems.length > 0 &&
              <div className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                <div className="flex flex-col items-center gap-2 justify-center h-full w-full">
                    <div className="text-center">
                        <FormattedMessage
                            id="product-index-cart-added"
                            description="Product added to the cart" // Description should be a string literal
                            defaultMessage="Product added to the cart" // Message should be a string literal
                        />
                    </div>
                    <Link href="/cart" className="flex justify-center pt-3">
                            <button className={styles.btnAdmin}>
                                <FormattedMessage id="product-index-cart-added-redirect-btn"
                                description="Go to cart" // Description should be a string literal
                                defaultMessage="Go to cart" // Message should be a string literal
                                />
                            </button>
                    </Link>
                </div>
            </div>
          }
          <ProductCard products={products} loading={false} postsEnd={false} enableLoadMore={true} />
        </div>
      </div>
    </>
  );
}

export default Products;