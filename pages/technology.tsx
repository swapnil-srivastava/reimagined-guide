import { useEffect, useState } from "react";
import Metatags from "../components/Metatags";
import TechBox from "../components/TechBox";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { LEADINGTECH, TECHNOLOGIES } from "../database.types";
import { supaClient } from "../supa-client";

export default function Technology() {
  const [techStackState, setTechStackState] = useState<TECHNOLOGIES[]>();
  const [leadingTechState, setLeadingTechState] = useState<LEADINGTECH[]>();

  useEffect(() => {
    // getTechStack();
    getTechStackFirebase();
    getLeadingTechFirebase();
  }, []);

  async function getTechStack() {
    try {
      // 👇️ const data: GetTechStackResponse
      const { data, status } = await axios.get("/api/techstack", {
        headers: {
          Accept: "application/json",
        },
      });

      const { techStack } = data;

      // setTechStackState(techStack); // change data based on TECHNOLOGIES type

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("error message: ", error.message);
        return error.message;
      } else {
        console.log("unexpected error: ", error);
        return "An unexpected error occurred";
      }
    }
  }

  async function getLeadingTechFirebase() {
    try {
      let { data: leadingtech, error } = await supaClient
        .from("leadingtech")
        .select("*");

      setLeadingTechState(leadingtech);

      return leadingtech;
    } catch (error) {
    } finally {
    }
  }

  async function getTechStackFirebase() {
    try {
      let { data: technologies, error } = await supaClient
        .from("technologies")
        .select("*");

      setTechStackState(technologies);

      return technologies;
    } catch (error) {
    } finally {
    }
  }

  return (
    <>
      <Metatags description={`Technology stack that I am fluent in`} />
      <div className="px-10 pb-2 text-2xl font-extralight dark:text-blog-white">
        Tech Stack
      </div>

      <div className="flex py-10 px-10 pt-2 flex-wrap">
        {techStackState &&
          techStackState.map(
            ({ id, tech_color: colorTechStack, name: techName }) => (
              <TechBox
                key={techName}
                techStackName={techName}
                techStackColor={colorTechStack}
              >
                {/* if font awesome icon is to used */}
                {/* <a href={`https://www.linkedin.com/sharing/share-offsite/?url=https://www.swapnilsrivastava.eu/`}>
              <FontAwesomeIcon
                  icon={faLinkedin}
                  size={'2xl'}
                  style={{ color: "#0072b1" }}
                  className="h-20 w-20 px-2 pt-1"
              />
            </a> */}
              </TechBox>
            )
          )}
      </div>

      <div className="px-10 pb-0 text-2xl font-extralight dark:text-blog-white">
        Leading Tech
      </div>
      <div className="flex py-10 px-10 pt-2 flex-wrap">
        {leadingTechState &&
          leadingTechState.map(
            ({ id, tech_color: colorTechStack, name: techName }) => (
              <TechBox
                key={id}
                techStackName={techName}
                techStackColor={colorTechStack}
              >
                {/* if svg is to be used then  */}
                {/* <svg xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 stroke-1 hover:stroke-2 px-2 pt-1"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path 
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                />
            </svg> */}
              </TechBox>
            )
          )}
      </div>
    </>
  );
}
