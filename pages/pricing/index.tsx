import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

import CheckoutButton from "../../components/CheckoutButton";

const Pricing = () => {

  return (
    <div className="h-screen flex flex-col items-center gap-2 font-poppins mt-10">
        {/* Title */}
        <div className="lg:text-4xl text-2xl dark:text-blog-white text-center">Choose the right package which is best for you!</div>

        {/* Pricing cards */}
        <div className="flex lg:flex-row flex-col gap-5 m-10">
            {/* Pricing card 1 */}
            <div className="w-80 mx-10 p-10 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
              <div className="flex flex-col">
                <div className="font-bold leading-loose">Basic Consultation</div>
                <div className="font-thin text-xs leading-loose">Ideal For: Small businesses and startups needing foundational advice</div>
                <div className="text-4xl text-center leading-loose">€75</div>
                {/* <div className="text-center font-thin leading-loose">No Payment</div> */}

                {/* button section */}
                <div className="text-center font-thin flex items-center justify-center mb-3">
                    <CheckoutButton priceId={'price_1Pe47VRomQdDoc7IzPHbnYkn'}/>
                </div>

              </div>

              <div className="flex flex-col leading-loose text-sm">
                  <div className="flex gap-2 ">
                    <div><FontAwesomeIcon icon={faCheck} /></div>
                    <div>1 hour call</div>
                  </div>
                  <div className="flex gap-2">
                    <div><FontAwesomeIcon icon={faCheck} /></div>
                    <div>Initial site audit</div>
                  </div>
                  <div className="flex gap-2">
                    <div><FontAwesomeIcon icon={faCheck} /></div>
                    <div>Basic SEO recommendations</div>
                  </div>
                  <div className="flex gap-2">
                    <div><FontAwesomeIcon icon={faCheck} /></div>
                    <div>Follow-up email support</div>
                  </div>
              </div>

            </div>

            {/* Pricing card 2 */}
            <div className="w-80 mx-10 p-10 text-blog-white bg-fun-blue-600 dark:bg-blog-white dark:text-blog-black hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
            <div className="flex flex-col">
                <div className="font-bold leading-loose">Basic Package</div>
                <div className="font-thin text-xs leading-loose">Ideal For: Growing businesses looking to optimize their online presence.</div>
                <div className="text-4xl text-center leading-loose">€1,000</div>
                {/* button section */}
                <div className="text-center font-thin flex items-center justify-center mb-3">
                    <CheckoutButton priceId={'price_1Pe47VRomQdDoc7IzPHbnYkn'}/>
                </div>
              </div>
              <div className="flex flex-col leading-loose text-sm lg:text-md">
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck} /></div>
                  <div>Simple website design</div>
                </div>
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck} /></div>
                  <div>Up to 5 pages</div>
                </div>
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck} /></div>
                  <div>Basic SEO setup</div>
                </div>
              </div>
            </div>

            {/* Pricing card 3 */}
            <div className="w-80 mx-10 p-10 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
            <div className="flex flex-col">
                <div className="font-bold leading-loose">Standard Package</div>
                <div className="font-thin text-xs leading-loose">Ideal For: Businesses with specific, large-scale projects</div>
                <div className="text-4xl text-center leading-loose">€2,000</div>
                {/* button section */}
                <div className="text-center font-thin flex items-center justify-center mb-3">
                  <CheckoutButton priceId={'price_1Pe47VRomQdDoc7IzPHbnYkn'}/>
                </div>
              </div>
              <div className="flex flex-col leading-loose text-sm lg:text-md">
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck}/></div>
                  <div>Custom website design</div>
                </div>
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck}/></div>
                  <div>Up to 10 pages</div>
                </div>
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck}/></div>
                  <div>Advanced SEO setup</div>
                </div>
              </div>
            </div>
        </div>

        {/* Pricing  Single Page */}
        <div className="bg-blog-white text-blog-black dark:bg-fun-blue-600 dark:text-blog-white py-24 sm:py-32 rounded-lg">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-blog-white sm:text-4xl">Simple no-tricks pricing</h2>
            {/* <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-blog-white">
              Distinctio et nulla eum soluta et neque labore quibusdam. Saepe et quasi iusto modi velit ut non voluptas
              in. Explicabo id ut laborum.
            </p> */}
          </div>
          <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
            <div className="p-8 sm:p-10 lg:flex-auto">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-blog-white">Preminum Package</h3>
              <p className="mt-6 text-base leading-7 text-gray-600 dark:text-blog-white">
               Unlock the expertise with a single investment - pay once, and your success is in good hands.
              </p>
              <div className="mt-10 flex items-center gap-x-4">
                <h4 className="flex-none text-sm font-semibold leading-6 text-fun-blue-500 dark:text-blog-white">What's included</h4>
                <div className="h-px flex-auto bg-gray-100" />
              </div>
              <ul
                role="list"
                className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 dark:text-blog-white sm:grid-cols-2 sm:gap-6"
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
              <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                <div className="mx-auto max-w-xs px-8">
                  <p className="text-base font-semibold text-gray-600">Pay once, own it forever</p>
                  <p className="mt-6 flex items-baseline justify-center gap-x-2">
                    <span className="text-5xl font-bold tracking-tight text-gray-900">€3500</span>
                    <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">EURO</span>
                  </p>
                  <CheckoutButton priceId={'price_1Pe47VRomQdDoc7IzPHbnYkn'} text={'Get it now'}/>
                  <p className="mt-6 text-xs leading-5 text-gray-600">
                    Invoices and receipts available for easy company reimbursement
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


const includedFeatures = [
  'Fully custom design and development',
  'Advanced e-commerce functionality',
  'Comprehensive SEO',
  'Official t-shirt',
]
