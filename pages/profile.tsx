import { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

// Accordion
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// JSON FORMS
import { JsonForms } from "@jsonforms/react";

import schema from "../lib/experiences/experiencesSchema.json";
import uischema from "../lib/experiences/uiExperiencesSchema.json";

import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";

// Supabase Interfaces
import { EXPERIENCES, EXPERIENCES_INSERT_DATA } from "../database.types";
import { supaClient } from "../supa-client";
import { SupashipUserInfo } from "../lib/hooks";

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

const Profile = () => {
  const [expanded, setExpanded] = useState<string | false>(false);
  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  async function getExperiences() {}

  return (
    <>
      <div className="m-4">
        {profile?.id ? <CreateExperience /> : ""}
        <Accordion
          expanded={expanded === "panel1"}
          onChange={handleChange("panel1")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography sx={{ width: "33%", flexShrink: 0 }}>
              HCL Tech Gmbh.
            </Typography>
            <Typography sx={{ color: "text.secondary" }}>
              March 2020 - Present - (Years)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Nulla facilisi. Phasellus sollicitudin nulla et quam mattis
              feugiat. Aliquam eget maximus est, id dignissim quam.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === "panel2"}
          onChange={handleChange("panel2")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2bh-content"
            id="panel2bh-header"
          >
            <Typography sx={{ width: "33%", flexShrink: 0 }}>
              IBM Pvt. Ltd.
            </Typography>
            <Typography sx={{ color: "text.secondary" }}>
              March 2019 - March 2020
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Donec placerat, lectus sed mattis semper, neque lectus feugiat
              lectus, varius pulvinar diam eros in elit. Pellentesque convallis
              laoreet laoreet.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === "panel3"}
          onChange={handleChange("panel3")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3bh-content"
            id="panel3bh-header"
          >
            <Typography sx={{ width: "33%", flexShrink: 0 }}>
              L & T Technonlogy Services
            </Typography>
            <Typography sx={{ color: "text.secondary" }}>
              Nov 2016 - Feb 2019
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer
              sit amet egestas eros, vitae egestas augue. Duis vel est augue.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === "panel4"}
          onChange={handleChange("panel4")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel4bh-content"
            id="panel4bh-header"
          >
            <Typography sx={{ width: "33%", flexShrink: 0 }}>
              Software Paradigm Infotech Pvt. Ltd.
            </Typography>
            <Typography sx={{ color: "text.secondary" }}>
              April 2014 - October 2016
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer
              sit amet egestas eros, vitae egestas augue. Duis vel est augue.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </div>
    </>
  );
};

function CreateExperience() {
  const [data, setData] = useState<EXPERIENCES_INSERT_DATA>();

  const clearData = () => {
    setData({
      company: "",
      location: "",
      position: "",
      position_start_time: "",
      position_end_time: "",
      position_description: "",
      isPresent: false,
    });
  };

  // Validate for Company
  const isValidCompany =
    data?.company?.length > 3 && data?.company?.length < 100;

  // Create a new post in supabase postgres
  const createExperience = async () => {
    if (!data?.company && !data?.company) return;

    const { data: supaData, error } = await supaClient
      .from("experiences")
      .insert([
        {
          company: data?.company,
          location: data?.location,
          position: data?.position,
          position_start_time: data?.position_start_time,
          position_end_time: data?.position_end_time,
          position_description: data?.position_description,
          isPresent: data?.isPresent ?? false,
        },
      ]);

    toast.success("Experience Succesfully Created");
  };

  const clearExperience = async (e) => {
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
            disabled={!isValidCompany}
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
            onClick={() => createExperience()}
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
            onClick={clearExperience}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

export default Profile;
