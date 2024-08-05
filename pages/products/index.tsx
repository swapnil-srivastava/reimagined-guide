import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import ProductCard from "../../components/ProductCard";

function Products() {

  const [products, setProducts] = useState(
    [
      {
          "id": "1cfb24e5-cd82-46r65-8497-6f0ebb5201fc",
          "user_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
          "name": "Basic Consultation",
          "quantity": "1",
          "description": "Ideal For: Small businesses and startups needing foundational advice",
          "price": "100.00",
          "stock": "100",
          "created_at": "2023-12-11T21:37:20.899498+00:00",
      },
      {
        "id": "1cfb24e5-cd82-466y5-8497-6f0ebb5201fc",
        "user_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
        "name": "Basic Consultation",
        "quantity": "1",
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
      "quantity": "4",
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
        <div className="font-poppins lg:text-5xl text-3xl dark:text-blog-white text-blog-black p-10 self-center">
            <FormattedMessage
                id="products-heading"
                description="Products" // Description should be a string literal
                defaultMessage="Products" // Message should be a string literal
            />
        </div>
        <div className="lg:px-14 lg:pl-20 lg:py-5 px-2 py-1 flex flex-wrap flex-row lg:gap-x-20 lg:gap-y-11 gap-y-10 md:justify-start justify-center">
          <ProductCard products={products} loading={false} postsEnd={false} enableLoadMore={true} onQuantityChange={(product) => handleProductChange(product)}/>
        </div>
      </div>
    </>
  );
}

export default Products;