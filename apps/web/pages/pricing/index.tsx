import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import Head from "next/head";

import CheckoutButton from "../../components/CheckoutButton";
import Metatags from "../../components/Metatags";

const Pricing = () => {
  const intl = useIntl();

  const includedFeatures = [
    intl.formatMessage({
      id: "pricing-feature-custom-design",
      description: "Fully custom design and development",
      defaultMessage: "Fully custom design and development"
    }),
    intl.formatMessage({
      id: "pricing-feature-ecommerce",
      description: "Advanced e-commerce functionality",
      defaultMessage: "Advanced e-commerce functionality"
    }),
    intl.formatMessage({
      id: "pricing-feature-seo",
      description: "Comprehensive SEO",
      defaultMessage: "Comprehensive SEO"
    }),
    intl.formatMessage({
      id: "pricing-feature-tshirt",
      description: "Official t-shirt",
      defaultMessage: "Official t-shirt"
    })
  ];

  // JSON-LD structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Web Development & Consultation Pricing",
    "description": "Professional web development packages and consultation services",
    "itemListElement": [
      {
        "@type": "Offer",
        "position": 1,
        "name": "Basic Consultation",
        "description": "30-minute consultation session to discuss your web development needs and project requirements",
        "price": "75",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
        "url": "https://swapnilsrivastava.eu/pricing",
        "itemOffered": {
          "@type": "Service",
          "name": "Web Development Consultation"
        }
      },
      {
        "@type": "Offer",
        "position": 2,
        "name": "Basic Package",
        "description": "Complete web development package with responsive design and basic features",
        "price": "1000",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
        "url": "https://swapnilsrivastava.eu/pricing",
        "itemOffered": {
          "@type": "Service",
          "name": "Basic Web Development"
        }
      },
      {
        "@type": "Offer",
        "position": 3,
        "name": "Standard Package",
        "description": "Advanced web development with custom features and SEO optimization",
        "price": "2500",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
        "url": "https://swapnilsrivastava.eu/pricing",
        "itemOffered": {
          "@type": "Service",
          "name": "Standard Web Development"
        }
      },
      {
        "@type": "Offer",
        "position": 4,
        "name": "Premium Package",
        "description": "Enterprise-level web development with e-commerce, advanced SEO, and custom design",
        "price": "3500",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
        "url": "https://swapnilsrivastava.eu/pricing",
        "itemOffered": {
          "@type": "Service",
          "name": "Premium Web Development"
        }
      }
    ]
  };

  return (
    <>
      <Metatags
        title="Pricing - Web Development & Consultation Services | Swapnil's Odyssey"
        description="Transparent pricing for professional web development services. Choose from consultation, basic, standard, or premium packages. Custom design, SEO optimization, and e-commerce solutions starting from €75."
        image="https://dbydvpdhbaqudqqjteoq.supabase.co/storage/v1/object/sign/avatars/profile.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhdmF0YXJzL3Byb2ZpbGUucG5nIiwiaWF0IjoxNzIyMDMzMzMwLCJleHAiOjIwMzczOTMzMzB9.2fCp8-hDw_e05QacUp-MRSDYVp08Z-4TJzJ8RJqmyKo"
      />
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <link rel="canonical" href="https://swapnilsrivastava.eu/pricing" />
      </Head>
      <div className="min-h-screen flex flex-col items-center gap-2 font-poppins mt-10 px-4">
        {/* Title */}
        <h1 className="lg:text-4xl text-2xl text-blog-black dark:text-blog-white text-center max-w-4xl px-4 mb-6">
          <FormattedMessage
            id="pricing-title"
            description="Choose the right package which is best for you!"
            defaultMessage="Choose the right package which is best for you!"
          />
        </h1>

        {/* Pricing cards */}
        <div className="flex lg:flex-row flex-col gap-5 m-10">
            {/* Pricing card 1 */}
            <article className="w-80 mx-10 p-10 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
              <div className="flex flex-col">
                <h2 className="font-bold leading-loose text-blog-black dark:text-blog-white">
                  <FormattedMessage
                    id="pricing-basic-consultation-title"
                    description="Basic Consultation"
                    defaultMessage="Basic Consultation"
                  />
                </h2>
                <p className="font-thin text-xs leading-loose text-gray-600 dark:text-gray-300">
                  <FormattedMessage
                    id="pricing-basic-consultation-subtitle"
                    description="Ideal For: Small businesses and startups needing foundational advice"
                    defaultMessage="Ideal For: Small businesses and startups needing foundational advice"
                  />
                </p>
                <p className="text-4xl text-center leading-loose text-blog-black dark:text-blog-white">€75</p>
                {/* <div className="text-center font-thin leading-loose">No Payment</div> */}

                {/* button section */}
                <div className="text-center font-thin flex items-center justify-center mb-3 text-blog-black dark:text-blog-white">
                    <CheckoutButton priceId={'price_1PepBzRomQdDoc7IMPkYqS78'}/>
                </div>

              </div>

              <div className="flex flex-col leading-loose text-sm text-blog-black dark:text-blog-white">
                  <div className="flex gap-2 ">
                    <div><FontAwesomeIcon icon={faCheck} /></div>
                    <div>
                      <FormattedMessage
                        id="pricing-basic-1-hour-call"
                        description="1 hour call"
                        defaultMessage="1 hour call"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div><FontAwesomeIcon icon={faCheck} /></div>
                    <div>
                      <FormattedMessage
                        id="pricing-basic-initial-audit"
                        description="Initial site audit"
                        defaultMessage="Initial site audit"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div><FontAwesomeIcon icon={faCheck} /></div>
                    <div>
                      <FormattedMessage
                        id="pricing-basic-seo-recommendations"
                        description="Basic SEO recommendations"
                        defaultMessage="Basic SEO recommendations"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div><FontAwesomeIcon icon={faCheck} /></div>
                    <div>
                      <FormattedMessage
                        id="pricing-basic-email-support"
                        description="Follow-up email support"
                        defaultMessage="Follow-up email support"
                      />
                    </div>
                  </div>
              </div>

            </article>

            {/* Pricing card 2 */}
            <article className="w-80 mx-10 p-10 text-blog-white bg-fun-blue-600 dark:bg-blog-white dark:text-blog-black hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
            <div className="flex flex-col">
                <h2 className="font-bold leading-loose text-blog-white dark:text-blog-black">
                  <FormattedMessage
                    id="pricing-basic-package-title"
                    description="Basic Package"
                    defaultMessage="Basic Package"
                  />
                </h2>
                <p className="font-thin text-xs leading-loose text-gray-100 dark:text-gray-600">
                  <FormattedMessage
                    id="pricing-basic-package-subtitle"
                    description="Ideal For: Growing businesses looking to optimize their online presence."
                    defaultMessage="Ideal For: Growing businesses looking to optimize their online presence."
                  />
                </p>
                <p className="text-4xl text-center leading-loose text-blog-white dark:text-blog-black">€1,000</p>
                {/* button section */}
                <div className="text-center font-thin flex items-center justify-center mb-3 text-blog-white dark:text-blog-black">
                    <CheckoutButton priceId={'price_1Pe4OYRomQdDoc7IJpfJFW8O'}/>
                </div>
              </div>
              <div className="flex flex-col leading-loose text-sm lg:text-md text-blog-white dark:text-blog-black">
                <div className="flex gap-2">
                  <div className="text-blog-white dark:text-blog-black"><FontAwesomeIcon icon={faCheck} /></div>
                  <div className="text-blog-white dark:text-blog-black">
                    <FormattedMessage
                      id="pricing-simple-website-design"
                      description="Simple website design"
                      defaultMessage="Simple website design"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-blog-white dark:text-blog-black"><FontAwesomeIcon icon={faCheck} /></div>
                  <div className="text-blog-white dark:text-blog-black">
                    <FormattedMessage
                      id="pricing-up-to-5-pages"
                      description="Up to 5 pages"
                      defaultMessage="Up to 5 pages"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-blog-white dark:text-blog-black"><FontAwesomeIcon icon={faCheck} /></div>
                  <div className="text-blog-white dark:text-blog-black">
                    <FormattedMessage
                      id="pricing-basic-seo-setup"
                      description="Basic SEO setup"
                      defaultMessage="Basic SEO setup"
                    />
                  </div>
                </div>
              </div>
            </article>

            {/* Pricing card 3 */}
            <article className="w-80 mx-10 p-10 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
              <div className="flex flex-col">
                <h2 className="font-bold leading-loose text-blog-black dark:text-blog-white">
                  <FormattedMessage
                    id="pricing-standard-package"
                    description="Standard Package"
                    defaultMessage="Standard Package"
                  />
                </h2>
                <p className="font-thin text-xs leading-loose text-gray-600 dark:text-gray-300">
                  <FormattedMessage
                    id="pricing-standard-package-description"
                    description="Ideal For: Businesses with specific, large-scale projects"
                    defaultMessage="Ideal For: Businesses with specific, large-scale projects"
                  />
                </p>
                <p className="text-4xl text-center leading-loose text-blog-black dark:text-blog-white">€2,500</p>
                {/* button section */}
                <div className="text-center font-thin flex items-center justify-center mb-3 text-blog-black dark:text-blog-white">
                  <CheckoutButton priceId={'price_1Pe4S4RomQdDoc7IvoWyNYt8'}/>
                </div>
              </div>
              <div className="flex flex-col leading-loose text-sm lg:text-md text-blog-black dark:text-blog-white">
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck}/></div>
                  <div>
                    <FormattedMessage
                      id="pricing-custom-website-design"
                      description="Custom website design"
                      defaultMessage="Custom website design"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck}/></div>
                  <div>
                    <FormattedMessage
                      id="pricing-up-to-10-pages"
                      description="Up to 10 pages"
                      defaultMessage="Up to 10 pages"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck}/></div>
                  <div>
                    <FormattedMessage
                      id="pricing-advanced-seo-setup"
                      description="Advanced SEO setup"
                      defaultMessage="Advanced SEO setup"
                    />
                  </div>
                </div>
              </div>
            </article>
          </div>

        {/* Simple no-tricks Pricing */}
        <section className="w-full max-w-7xl mx-auto py-12 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 mb-12">
          <article className="flex flex-col items-center justify-center bg-fun-blue-600 dark:bg-blog-white p-10 hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125 ring-1 ring-fun-blue-700 dark:ring-fun-blue-500">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-center font-bold mt-8 sm:mt-16 lg:mt-20 mb-8 text-blog-white dark:text-blog-black">
              <FormattedMessage
                id="pricing-simple-no-tricks-pricing"
                description="Simple no-tricks pricing"
                defaultMessage="Simple no-tricks pricing"
              />
            </h2>
            <div className="text-center">
              <div className="flex flex-col items-center justify-center p-2">
                <p className="text-6xl text-blog-white dark:text-blog-black">
                  <FormattedMessage
                    id="pricing-premium-package-price"
                    description="Premium package price"
                    defaultMessage="€3,500"
                  />
                </p>
                <h3 className="font-bold text-blog-white dark:text-blog-black">
                  <FormattedMessage
                    id="pricing-premium-package"
                    description="Premium Package"
                    defaultMessage="Premium Package"
                  />
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  <FormattedMessage
                    id="pricing-premium-package-description"
                    description="Premium package description"
                    defaultMessage="Enterprise-level web development with e-commerce, advanced SEO, and custom design."
                  />
                </p>
              </div>

              {/* button section */}
              <div className="text-center font-thin flex items-center justify-center mb-3 text-blog-white dark:text-blog-black">
                  <CheckoutButton priceId={'price_1Pe4WlRomQdDoc7IGLCdnGI1'}/>
              </div>
            </div>

            <div className="mt-10 flex items-center gap-x-4 w-full max-w-2xl">
              <h4 className="flex-none text-sm font-semibold leading-6 text-blog-white dark:text-fun-blue-600">
                  <FormattedMessage
                    id="pricing-whats-included"
                    description="What's included"
                    defaultMessage="What's included"
                  />
                </h4>
                <div className="h-px flex-auto bg-gray-200 dark:bg-gray-600" />
              </div>
              <ul
                role="list"
                className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-blog-white dark:text-blog-black sm:grid-cols-2 sm:gap-6"
              >
                {includedFeatures.map((feature) => (
                  <li key={feature} className="flex gap-x-3 items-center text-blog-white dark:text-blog-black">
                    <FontAwesomeIcon icon={faCheck} className="text-blog-white dark:text-blog-black" />
                    {feature}
                  </li>
                ))}
              </ul>
          </article>
        </section>

      </div>
    </>
  );
};

export default Pricing;
