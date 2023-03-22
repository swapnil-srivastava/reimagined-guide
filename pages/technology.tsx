// importing styles
import adminStyles from "../styles/Admin.module.css";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import axios from "axios";
import kebabCase from "lodash.kebabcase";
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
import { randomUUID } from "crypto";

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
  const [userAuth, setUserAuth] = useState<User>();

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
        .select("*");

      setLeadingTechState(leadingtech);

      return leadingtech;
    } catch (error) {
    } finally {
    }
  }

  async function getTechStackSupabase() {
    try {
      const {
        data: { user },
      } = await supaClient.auth.getUser();

      console.log("user =====>", user?.id);
      console.log("profile =====>", profile?.id);

      setUserAuth(user);

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

      {/* CREATE Tech Stack */}
      {profile?.id === userAuth?.id ? <CreateNewTechStack /> : ""}
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

      {/* CREATE LEADING Tech Stack */}
      {/* <AuthCheck>
        <CreateLeadingTech />
      </AuthCheck> */}

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

function CreateNewTechStack() {
  type TECHNAME_OBJ = Pick<TECHNOLOGIES, "name">;
  type TECHNAME = TECHNAME_OBJ["name"];

  const router = useRouter();

  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  const [techStack, setTechStack] = useState<TECHNAME>("");

  // Validate length
  const isValidTechStack = techStack.length > 3 && techStack.length < 100;

  // Create a new post in supabase postgres
  const createTechStack = async (e) => {
    e.preventDefault();

    // Tip: give all fields a default value here
    const { data, error } = await supaClient
      .from("technologies")
      .insert([{ name: techStack, uid: profile?.id }]);

    toast.success("Tech Stack created!");

    // Imperative navigation after doc is set
    router.push(`/technology`);
  };

  const clearTechStack = async (e) => {
    e.preventDefault();
    setTechStack("");
  };

  return (
    <form onSubmit={createTechStack}>
      <div
        className="flex item-center border-b border-fun-blue-500 dark:border-fun-blue-300 py-4
        dark:bg-blog-white"
      >
        <span className="sr-only">
          Add a new tech stack and create the tech stack
        </span>

        <div className="relative w-full mx-3">
          <input
            id="techStack"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            placeholder="Not supposed to be seen"
            className="peer dark:bg-blog-white
                    text-fun-blue-500
                    dark:text-fun-blue-500
                    bg-blog-white
                    border-none 
                    focus:outline-none
                    block 
                    w-full 
                    rounded-sm
                    text-sm 
                    md:text-lg
                    leading-tight
                    h-10
                    placeholder-transparent"
          />
          <label
            htmlFor="techStack"
            className="absolute left-0 -top-3.5 
                    text-fun-blue-600 text-sm 
                    transition-all 
                    peer-placeholder-shown:text-base 
                    peer-placeholder-shown:text-fun-blue-400 
                    peer-placeholder-shown:top-2 
                    peer-focus:-top-3.5 
                    peer-focus:text-fun-blue-600
                    peer-focus:text-sm"
          >
            Enter Your Next Tech Stack Name!!
          </label>
        </div>

        <button
          type="submit"
          disabled={!isValidTechStack}
          className={adminStyles.btnAdmin}
        >
          Create
        </button>
        <button
          className="border border-fun-blue-500 dark:border-fun-blue-500
          text-fun-blue-500 
          dark:text-fun-blue-500
          hover:text-fun-blue-400 
          dark:hover:text-slate-300 
          text-sm rounded py-1 px-2 mx-1 mr-4"
          type="button"
          onClick={clearTechStack}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
