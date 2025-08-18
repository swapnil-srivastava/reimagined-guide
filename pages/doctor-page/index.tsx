import React from "react";
import { FormattedMessage } from 'react-intl';

// NextJS
import Link from "next/link";

// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faUser } from "@fortawesome/free-solid-svg-icons";

const DoctorPage = () => {
  return (
    <div className="flex flex-col h-screen justify-between">
      <div className="flex flex-col justify-between items-center">
        {/* Doctor Information Card */}
        <div
          className="p-3 bg-blog-white mt-10
                  dark:bg-fun-blue-600 dark:text-blog-white
                  rounded-lg drop-shadow-lg hover:drop-shadow-xl hover:brightness-125 
                  flex flex-row gap-2 justify-between items-center w-11/12"
        >
          <Link href="/choose-your-doctor" legacyBehavior>
            <div className="bg-fun-blue-300 dark:text-blog-black w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 p-0.5 m-0.5 flex items-center justify-center rounded-full transition-filter duration-500 hover:filter hover:brightness-125">
              <FontAwesomeIcon icon={faChevronLeft} size="lg" />
            </div>
          </Link>
          <div className="text-3xl md:text-5xl lg:text-6xl">
            <FormattedMessage
              id="doctor-page-doctor-name"
              description="Doctor name"
              defaultMessage="Doctor name"
            />
          </div>
          <Link href="/choose-your-doctor" legacyBehavior>
            <div className="bg-fun-blue-300 dark:text-blog-black w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 p-0.5 m-0.5 flex items-center justify-center rounded-full transition-filter duration-500 hover:filter hover:brightness-125">
              <FontAwesomeIcon icon={faUser} />
            </div>
          </Link>
        </div>
        <div className="md:text-xl lg:text-2xl text-base dark:text-blog-white text-blog-black font-thin leading-none tracking-tight">
          Doctor Information
        </div>
        <div className="mb-4 md:text-xl lg:text-2xl text-base dark:text-blog-white text-blog-black font-thin leading-none tracking-tight">
          Visit History - Postpone, cancel appointment
        </div>
      </div>
      <div className="flex flex-row mb-10 self-center">
        <Link href="/appointment-page" legacyBehavior>
          <button
            className="focus:outline-none focus:ring-2 
                      focus:ring-hit-pink-400 
                      focus:ring-offset-2 text-xl
                      font-semibold bg-hit-pink-500 dark:text-blog-black 
                      p-2 m-1 flex rounded items-center justify-center gap-x-2
                      transition-filter duration-500 hover:filter hover:brightness-125"
          >
            Doctor Page
          </button>
        </Link>
      </div>
    </div>
  );
};

export default DoctorPage;
