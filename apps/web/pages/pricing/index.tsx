import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import CheckoutButton from "../../components/CheckoutButton";

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

  return (
    <div className="min-h-screen flex flex-col items-center gap-2 font-poppins mt-10">
        {/* Title */}
        <div className="lg:text-4xl text-2xl text-blog-black dark:text-blog-white text-center">
          <FormattedMessage
            id="pricing-title"
            description="Choose the right package which is best for you!"
            defaultMessage="Choose the right package which is best for you!"
          />
        </div>

        {/* Pricing cards */}
        <div className="flex lg:flex-row flex-col gap-5 m-10">
            {/* Pricing card 1 */}
            <div className="w-80 mx-10 p-10 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
              <div className="flex flex-col">
                <div className="font-bold leading-loose text-blog-black dark:text-blog-white">
                  <FormattedMessage
                    id="pricing-basic-consultation-title"
                    description="Basic Consultation"
                    defaultMessage="Basic Consultation"
                  />
                </div>
                <div className="font-thin text-xs leading-loose text-gray-600 dark:text-gray-300">
                  <FormattedMessage
                    id="pricing-basic-consultation-subtitle"
                    description="Ideal For: Small businesses and startups needing foundational advice"
                    defaultMessage="Ideal For: Small businesses and startups needing foundational advice"
                  />
                </div>
                <div className="text-4xl text-center leading-loose text-blog-black dark:text-blog-white">€75</div>
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

            </div>

            {/* Pricing card 2 */}
            <div className="w-80 mx-10 p-10 text-blog-white bg-fun-blue-600 dark:bg-blog-white dark:text-blog-black hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
            <div className="flex flex-col">
                <div className="font-bold leading-loose text-blog-white dark:text-blog-black">
                  <FormattedMessage
                    id="pricing-basic-package-title"
                    description="Basic Package"
                    defaultMessage="Basic Package"
                  />
                </div>
                <div className="font-thin text-xs leading-loose text-gray-100 dark:text-gray-600">
                  <FormattedMessage
                    id="pricing-basic-package-subtitle"
                    description="Ideal For: Growing businesses looking to optimize their online presence."
                    defaultMessage="Ideal For: Growing businesses looking to optimize their online presence."
                  />
                </div>
                <div className="text-4xl text-center leading-loose text-blog-white dark:text-blog-black">€1,000</div>
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
            </div>

            {/* Pricing card 3 */}
            <div className="w-80 mx-10 p-10 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
            <div className="flex flex-col">
                <div className="font-bold leading-loose text-blog-black dark:text-blog-white">
                  <FormattedMessage
                    id="pricing-standard-package"
                    description="Standard Package"
                    defaultMessage="Standard Package"
                  />
                </div>
                <div className="font-thin text-xs leading-loose text-gray-600 dark:text-gray-300">
                  <FormattedMessage
                    id="pricing-standard-package-description"
                    description="Ideal For: Businesses with specific, large-scale projects"
                    defaultMessage="Ideal For: Businesses with specific, large-scale projects"
                  />
                </div>
                <div className="text-4xl text-center leading-loose text-blog-black dark:text-blog-white">€2,500</div>
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
            </div>
        </div>

        {/* Pricing  Single Page */}
        <div className="bg-blog-white text-blog-black dark:bg-fun-blue-600 dark:text-blog-white py-24 sm:py-32 rounded-lg">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-blog-black dark:text-blog-white sm:text-4xl">
              <FormattedMessage
                id="pricing-simple-no-tricks-pricing"
                description="Simple no-tricks pricing"
                defaultMessage="Simple no-tricks pricing"
              />
            </h2>
            {/* <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-blog-white">
              Distinctio et nulla eum soluta et neque labore quibusdam. Saepe et quasi iusto modi velit ut non voluptas
              in. Explicabo id ut laborum.
            </p> */}
          </div>
          <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
            <div className="p-8 sm:p-10 lg:flex-auto">
              <h3 className="text-2xl font-bold tracking-tight text-blog-black dark:text-blog-white">
                <FormattedMessage
                  id="pricing-premium-package"
                  description="Premium Package"
                  defaultMessage="Premium Package"
                />
              </h3>
              <p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-300">
                <FormattedMessage
                  id="pricing-premium-package-description"
                  description="Unlock the expertise with a single investment - pay once, and your success is in good hands."
                  defaultMessage="Unlock the expertise with a single investment - pay once, and your success is in good hands."
                />
              </p>
              <div className="mt-10 flex items-center gap-x-4">
                <h4 className="flex-none text-sm font-semibold leading-6 text-fun-blue-600 dark:text-fun-blue-300">
                  <FormattedMessage
                    id="pricing-whats-included"
                    description="What's included"
                    defaultMessage="What's included"
                  />
                </h4>
                <div className="h-px flex-auto bg-gray-100" />
              </div>
              <ul
                role="list"
                className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 dark:text-gray-300 sm:grid-cols-2 sm:gap-6"
              >
                {includedFeatures.map((feature) => (
                  <li key={feature} className="flex gap-x-3 items-center">
                    <FontAwesomeIcon icon={faCheck} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
              <div className="rounded-2xl bg-gray-50 dark:bg-fun-blue-700 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                <div className="mx-auto max-w-xs px-8">
                  <p className="text-base font-semibold text-gray-600 dark:text-gray-300">
                    <FormattedMessage
                      id="pricing-pay-once-own-forever"
                      description="Pay once, own it forever"
                      defaultMessage="Pay once, own it forever"
                    />
                  </p>
                  <p className="mt-6 flex items-baseline justify-center gap-x-2">
                    <span className="text-5xl font-bold tracking-tight text-blog-black dark:text-blog-white">€3500</span>
                    <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600 dark:text-gray-400">EURO</span>
                  </p>
                  <CheckoutButton priceId={'price_1PepHnRomQdDoc7ILk13S3dE'} text={'Get it now'}/>
                  <p className="mt-6 text-xs leading-5 text-gray-600 dark:text-gray-400">
                    <FormattedMessage
                      id="pricing-invoices-receipts-available"
                      description="Invoices and receipts available for easy company reimbursement"
                      defaultMessage="Invoices and receipts available for easy company reimbursement"
                    />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Pricing;
