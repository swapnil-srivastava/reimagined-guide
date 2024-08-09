import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import { useSelector } from "react-redux";
import Link from "next/link";

// CSS
import styles from "../../styles/Admin.module.css";

// Components
import ProductCard from "../../components/ProductCard";

// Redux
import { RootState } from "../../lib/interfaces/interface";


function Products() {

  const selectUser = (state: RootState) => state.cart;
  const { cartItems } = useSelector(selectUser);

  const [products, setProducts] = useState(
    [
      {
          "id": "1cfb24e5-cd82-46r65-8497-6f0ebb5201fc",
          "user_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
          "name": "Basic Consultation",
          "description": "Ideal For: Small businesses and startups needing foundational advice",
          "price": "100.00",
          "stock": "100",
          "created_at": "2023-12-11T21:37:20.899498+00:00",
      },
      {
        "id": "1cfb24e5-cd82-466y5-8497-6f0ebb5201fc",
        "user_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
        "name": "Basic Consultation",
        "description": "Ideal For: Small businesses and startups needing foundational advice",
        "price": "100.00",
        "stock": "100",
        "created_at": "2023-12-11T21:37:20.899498+00:00",
    },
    {
      "id": "1cfb2e4e5-cd82-4665-8497-6f0ebb5201fc",
      "user_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
      "name": "Basic Consultation",
      "description": "Ideal For: Small businesses and startups needing foundational advice",
      "price": "100.00",
      "stock": "100",
      "created_at": "2023-12-11T21:37:20.899498+00:00",
    },
    {
      "id": "1cfb624e5-cd82-4665-8497-6f0ebb5201fc",
      "user_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
      "name": "Basic Consultation",
      "description": "Ideal For: Small businesses and startups needing foundational advice",
      "price": "100.00",
      "stock": "100",
      "created_at": "2023-12-11T21:37:20.899498+00:00",
    },
    {
      "id": "1cfb24e5-cd82-4665-8497-6f07ebb5201fc",
      "user_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
      "name": "Basic Consultation",
      "description": "Ideal For: Small businesses and startups needing foundational advice",
      "price": "100.00",
      "stock": "100",
      "created_at": "2023-12-11T21:37:20.899498+00:00",
    },
    {
      "id": "1cfb524e5-cd82-4665-8497-6f0ebb5201fc",
      "user_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
      "name": "Basic Consultationhgjhjbjb  jhgjhgjh ghgjhj ",
      "description": "Ideal For: Small businesses and startups needing foundational advice",
      "price": "100.00",
      "stock": "100",
      "created_at": "2023-12-11T21:37:20.899498+00:00",
    },
    {
      "id": "1cfb24e5-cd82-4665-8497-6f06ebb5201fc",
      "user_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
      "name": "Basic Consultation",
      "description": "Ideal For: Small businesses and startups needing foundational advice",
      "price": "100.00",
      "stock": "100",
      "created_at": "2023-12-11T21:37:20.899498+00:00",
    },
    {
      "id": "1cfb24e5-cd482-4665-8497-6f0ebb5201fc",
      "user_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
      "name": "Basic Consultation",
      "description": "Ideal For: Small businesses and startups needing foundational advice",
      "price": "100.00",
      "stock": "100",
      "created_at": "2023-12-11T21:37:20.899498+00:00",
    },
    {
      "id": "1cfb24e5-cd82-46665-8497-6f0ebb5201fc",
      "user_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
      "name": "Basic Consultation",
      "description": "Ideal For: Small businesses and startups needing foundational advice",
      "price": "100.00",
      "stock": "100",
      "created_at": "2023-12-11T21:37:20.899498+00:00",
    },
    {
      "id": "1cfb424e5-c6d82-4665-8497-6f0ebb5201fc",
      "user_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
      "name": "Basic Consultation",
      "description": "Ideal For: Small businesses and startups needing foundational advice",
      "price": "100.00",
      "stock": "100",
      "created_at": "2023-12-11T21:37:20.899498+00:00",
    },  
    {
      "id": "15cfb24e5-c6d82-4665-8497-6f0ebb5201fc",
      "user_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
      "name": "Basic Consultation",
      "description": "Ideal For: Small businesses and startups needing foundational advice",
      "price": "100.00",
      "stock": "100",
      "created_at": "2023-12-11T21:37:20.899498+00:00",
    },
    {
      "id": "1c7fb24e5-cd82-4665-8497-6f0ebb5201fc",
      "user_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
      "name": "Basic Consultation",
      "description": "Ideal For: Small businesses and startups needing foundational advice",
      "price": "100.00",
      "stock": "100",
      "created_at": "2023-12-11T21:37:20.899498+00:00",
    },
    {
      "id": "1c5fb24e5-cd82-4665-8497-6f0ebb5201fc",
      "user_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
      "name": "Basic Consultation",
      "description": "Ideal For: Small businesses and startups needing foundational advice",
      "price": "100.00",
      "stock": "100",
      "created_at": "2023-12-11T21:37:20.899498+00:00",
    },
    {
      "id": "15cfb24e5-cd82-4665-8497-6f0ebb5201fc",
      "user_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
      "name": "Basic Consultation",
      "description": "Ideal For: Small businesses and startups needing foundational advice",
      "price": "100.00",
      "stock": "100",
      "created_at": "2023-12-11T21:37:20.899498+00:00",
    }
    ]
  );

  const handleProductChange = (updatedProduct) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

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
          <ProductCard products={products} loading={false} postsEnd={false} enableLoadMore={true} onQuantityChange={(product) => handleProductChange(product)}/>
        </div>
      </div>
    </>
  );
}

export default Products;