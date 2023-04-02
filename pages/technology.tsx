// importing styles
import adminStyles from "../styles/Admin.module.css";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import axios from "axios";
import Switch from "@mui/material/Switch";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";

// Interface
import { User } from "@supabase/supabase-js";

// Components
import Metatags from "../components/Metatags";
import TechBox from "../components/TechBox";
import AuthCheck from "../components/AuthCheck";

// Local Interface
import { LEADINGTECH, TECHNOLOGIES } from "../database.types";
import { supaClient } from "../supa-client";
import { SupashipUserInfo } from "../lib/hooks";

// JSON Forms 
import { JsonForms } from "@jsonforms/react";

import schema from "../lib/techStack/techStackSchema.json";
import uischema from "../lib/techStack/uiTechStackSchema.json";

import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";

interface RootState {
  counter: Object;
  users: UserState;
}

interface UserState {
  user: {
    uid: string;
    displayName: string;
    photoURL: string;
  };
  username: any;
  userInfo: SupashipUserInfo;
}

export default function Technology() {
  const [techStackState, setTechStackState] = useState<TECHNOLOGIES[]>();
  const [leadingTechState, setLeadingTechState] = useState<LEADINGTECH[]>();

  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  useEffect(() => {
    // getTechStack();
    getLeadingTechSupabase();
    getTechStackSupabase();
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

  async function getLeadingTechSupabase() {
    try {
      let { data: leadingtech, error } = await supaClient
        .from("leadingtech")
        .select("*")
        .eq("uid", process.env.NEXT_PUBLIC_SWAPNIL_ID);

      setLeadingTechState(leadingtech);

      return leadingtech;
    } catch (error) {
    } finally {
    }
  }

  async function getTechStackSupabase() {
    try {
      let { data: technologies, error } = await supaClient
        .from("technologies")
        .select("*")
        .eq("uid", process.env.NEXT_PUBLIC_SWAPNIL_ID);

      setTechStackState(technologies);

      return technologies;
    } catch (error) {
    } finally {
    }
  }

  return (
    <>
      <Metatags description={`Technology stack that I am fluent in`} />

      {/* CREATE Tech Stack */}
      {profile?.id ? <CreateNewTechStack /> : ""}
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

interface TechStackJSON {
  tech_stack_name: string;
  tech_stack_css: string;
  toggle: boolean
}

function CreateNewTechStack() {
  type TECHNAME_OBJ = Pick<TECHNOLOGIES, "name" | "tech_color">;
  type TECHNAME = TECHNAME_OBJ["name"];
  type TECHCOLOR = TECHNAME_OBJ["tech_color"];

  const router = useRouter();

  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  const [data, setData] = useState<TechStackJSON>();

  const clearData = () => {
    setData({
      tech_stack_css: '',
      tech_stack_name: '',
      toggle: false
    });
  };

  // Validate length
  const isValidTechStack = data?.tech_stack_name?.length > 3 && data?.tech_stack_name?.length < 100;
  // Validate length
  const isValidTechColor =
    ( data?.tech_stack_css?.length > 2 && data?.tech_stack_css?.length < 100) || data?.tech_stack_css?.length === 0;

  // Create a new post in supabase postgres
  const createTechStack = async () => {

    // Tip: give all fields a default value here
    const { data: supaData, error } = await supaClient
      .from(data?.toggle ? "technologies" : "leadingtech")
      .insert([{ name: data?.tech_stack_name, uid: profile?.id, tech_color: data?.tech_stack_css }]);

    toast.success(
      data?.toggle ? "Tech Stack created!" : "Leading Tech Stack created"
    );

    // Imperative navigation after doc is set
    router.push(`/technology`);
  };

  const clearTechStack = async (e) => {
    e.preventDefault();
    clearData();
  };

  return (
    <>
      <div className="flex flex-col gap-2 m-4">

      <JsonForms
        schema={schema}
        uischema={uischema}
        data={data}
        renderers={materialRenderers}
        cells={materialCells}
        onChange={({ errors, data }) => setData(data)}
      />

      <div className="flex self-center gap-2">
      <button
        type="submit"
        disabled={!isValidTechStack && !isValidTechColor}
        className="
          py-1 px-2
          font-light
          text-sm
          bg-hit-pink-500 
          border-4 border-hit-pink-500 
          rounded
          hover:filter hover:brightness-125
          flex-shrink-0 
          self-center
        "
        onClick={() => createTechStack()}>
            Create
      </button>
      <button
        className="
        border border-fun-blue-500 dark:border-fun-blue-500
        text-fun-blue-500 
        dark:text-fun-blue-500
        hover:text-fun-blue-400 
        dark:hover:text-slate-300 
        text-sm rounded py-1 px-2
        self-center"
        type="button"
        onClick={clearTechStack}
      >
        Cancel
      </button>
      </div>
      
      </div>
   </>
  );
}
