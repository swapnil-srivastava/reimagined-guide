import { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";

// Components
import Metatags from "../components/Metatags";
import TechBox from "../components/TechBox";

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

export async function getServerSideProps(context) {
  let { data: leadingTechState, error: leadingTechError } = await supaClient
    .from("leadingtech")
    .select("*")
    .eq("uid", process.env.NEXT_PUBLIC_SWAPNIL_ID);

  let { data: techStackState, error: techStackError } = await supaClient
    .from("technologies")
    .select("*")
    .eq("uid", process.env.NEXT_PUBLIC_SWAPNIL_ID);

  return {
    props: { techStackState, leadingTechState }, // will be passed to the page component as props
  };
}

export default function Technology(props) {
  const [techStackState, setTechStackState] = useState<TECHNOLOGIES[]>(
    props.techStackState
  );
  const [leadingTechState, setLeadingTechState] = useState<LEADINGTECH[]>(
    props.leadingTechState
  );

  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

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
                {}
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
                {}
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
  toggle: boolean;
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
      tech_stack_css: "",
      tech_stack_name: "",
      toggle: false,
    });
  };

  // Validate length
  const isValidTechStack =
    data?.tech_stack_name?.length > 3 && data?.tech_stack_name?.length < 100;
  // Validate length
  const isValidTechColor =
    (data?.tech_stack_css?.length > 2 && data?.tech_stack_css?.length < 100) ||
    data?.tech_stack_css?.length === 0;

  // Create a new post in supabase postgres
  const createTechStack = async () => {
    if (!data?.tech_stack_css && !data?.tech_stack_name) return;
    // Tip: give all fields a default value here
    const { data: supaData, error } = await supaClient
      .from(data?.toggle ? "technologies" : "leadingtech")
      .insert([
        {
          name: data?.tech_stack_name,
          uid: profile?.id,
          tech_color: data?.tech_stack_css,
        },
      ]);

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
      <div className="flex flex-col gap-2 my-4 px-4 py-2 text-blog-black dark:bg-blog-white">
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
            dark:text-blog-black
            bg-hit-pink-500 
            border-2 border-hit-pink-500 
            rounded
            hover:filter hover:brightness-125
            flex-shrink-0 
            self-center"
            onClick={() => createTechStack()}
          >
            Create
          </button>
          <button
            className="
            py-1 px-2
            font-light
            border
            border-fun-blue-500
            text-fun-blue-500
            text-sm rounded 
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
