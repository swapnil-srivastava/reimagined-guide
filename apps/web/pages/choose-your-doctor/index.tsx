import React, { useState } from "react";

// Nextjs
import Link from "next/link";

// JSON Forms
import { JsonForms } from "@jsonforms/react";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";

// Technology Schema
import schema from "../../lib/chooseYourDoctor/chooseYourDoctorSchema.json";
import uischema from "../../lib/chooseYourDoctor/uiChooseYourDoctorSchema.json";

import { Chip } from "@mui/material";

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Font Icons
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

const ChooseYourDoctor = () => {
  const [data, setData] = useState();

  return (
    <div className="flex flex-col h-screen justify-between">
      <div className="flex flex-col justify-between">
        <div className="self-start flex gap-2 items-center ml-5 mt-10">
          <Link href="/book-appointment" legacyBehavior>
            <div className="bg-fun-blue-300 dark:text-blog-black w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 p-0.5 m-0.5 flex items-center justify-center rounded-full transition-filter duration-500 hover:filter hover:brightness-125">
              <FontAwesomeIcon icon={faChevronLeft} size="lg" />
            </div>
          </Link>
          <div className="text-3xl md:text-5xl lg:text-6xl dark:text-blog-white text-blog-black font-bold leading-none tracking-tight ">
            Doctors
          </div>
        </div>
        <div className="dark:bg-blog-white my-2">
          <div className="mx-5 mb-2">
            <JsonForms
              schema={schema}
              uischema={uischema}
              data={data}
              renderers={materialRenderers}
              cells={materialCells}
              onChange={({ errors, data }) => setData(data)}
            />
          </div>
        </div>

        <div className="ml-5 mt-2 flex gap-1 md:text-xl lg:text-2xl text-base dark:text-blog-white text-blog-black font-thin leading-none tracking-tight">
          <Chip label="All" color="primary" />
          <Chip label="General Physician" color="primary" />
          <Chip label="Cardiologist" color="primary" />
          <Chip label="Ob and Gynae" color="primary" />
        </div>

        <div className="ml-5 mt-4 lg:flex lg:flex-row flex flex-col flex-wrap gap-3 lg:gap-y-2 mr-2 dark:text-blog-white text-blog-black">
          <Link href="/doctor-page" legacyBehavior>
            <div
              className="p-3
                  bg-blog-white 
                  dark:bg-fun-blue-600 dark:text-blog-white
                  rounded-lg
                  drop-shadow-lg
                  hover:drop-shadow-xl
                  hover:brightness-125"
            >
              <div>Row of Doctor</div>
            </div>
          </Link>
          <Link href="/doctor-page" legacyBehavior>
            <div
              className="p-3
                  bg-blog-white 
                  dark:bg-fun-blue-600 dark:text-blog-white
                  rounded-lg
                  drop-shadow-lg
                  hover:drop-shadow-xl
                  hover:brightness-125"
            >
              <div>Row of Doctor, book an appointment </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChooseYourDoctor;
