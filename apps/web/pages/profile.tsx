import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import moment from "moment";
import { FormattedMessage, useIntl } from "react-intl";
import type { NextPage } from 'next';

// Accordion
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Chip from "@mui/material/Chip";

// JSON FORMS
import { JsonForms } from "@jsonforms/react";

import schema from "../lib/experiences/experiencesSchema.json";
import uischema from "../lib/experiences/uiExperiencesSchema.json";

import skillSchema from "../lib/skills/skillsSchema.json";
import uiSkillSchema from "../lib/skills/uiSkillsSchema.json";

import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";

// Supabase Interfaces
import { EXPERIENCES, EXPERIENCES_INSERT_DATA } from "../database.types";
import { supaClient } from "../supa-client";
import { RootState } from "../lib/interfaces/interface";

import Metatags from "../components/Metatags";

const Profile: NextPage = () => {
  const intl = useIntl();
  const [expanded, setExpanded] = useState<string | false>(false);
  const [experiences, setExperiences] = useState<EXPERIENCES[]>();
  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  useEffect(() => {
    getExperiences();
  }, []);

  async function getExperiences() {
    let { data: experiences, error } = await supaClient
      .from("experiences")
      .select("*")
      .order("position_start_time", { ascending: false });

    setExperiences(experiences);
  }

  return (
    <>
      <Metatags/>
      <div className="min-h-screen bg-blog-white dark:bg-fun-blue-500 p-4 text-blog-black dark:text-blog-white">
        {profile?.id ? <CreateExperience /> : ""}
        {/* Overall All Experience :{" "}
        {moment("2014-04-01 10:00:00+00").fromNow(true)} */}
        {experiences &&
          experiences.map(
            (
              {
                company,
                position,
                position_start_time,
                position_end_time,
                isPresent,
                location,
                position_description,
                id,
              },
              index
            ) => (
              <Accordion
                expanded={expanded === `panel-${index + 1}`}
                onChange={handleChange(`panel-${index + 1}`)}
                key={index}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1bh-content"
                  id="panel1bh-header"
                >
                  <div className="flex justify-between w-full">
                    <p className="font-bold">{company}</p>
                    <p className="font-light">
                      {moment(position_start_time).format("MMM YYYY")} -{" "}
                      {isPresent
                        ? intl.formatMessage({
                            id: 'profile-present',
                            description: 'Present time indicator',
                            defaultMessage: 'Present'
                          })
                        : moment(position_end_time).format("MMM YYYY")}{" "}
                      -{" "}
                      {isPresent
                        ? moment(position_start_time).fromNow(true)
                        : `${Math.floor(
                            moment(position_end_time).diff(
                              position_start_time,
                              "years",
                              true
                            )
                          )} years ${Math.floor(
                            moment(position_end_time).diff(
                              position_start_time,
                              "months",
                              true
                            ) % 12
                          )} months`}
                    </p>
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <p className="font-bold">{position}</p>
                  <p className="font-bold">{location}</p>
                  <Typography className="whitespace-pre-wrap">
                    {position_description}
                    {profile?.id ? <CreateSkill experienceId={id} /> : ""}
                    <DisplaySkillChips experienceId={id} />
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )
          )}
      </div>
    </>
  );
};

function CreateExperience() {
  const intl = useIntl();
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

    toast.success(intl.formatMessage({
      id: 'profile-experience-created',
      description: 'Experience successfully created message',
      defaultMessage: 'Experience successfully created'
    }));
  };

  const clearExperience = async (e) => {
    e.preventDefault();
    clearData();
  };

  return (
    <>
      <div className="flex flex-col gap-2 my-4 px-4 py-2 bg-blog-white card--white">
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
            <FormattedMessage
              id="profile-create-button"
              description="Create button"
              defaultMessage="Create"
            />
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
            <FormattedMessage
              id="profile-cancel-button"
              description="Cancel button"
              defaultMessage="Cancel"
            />
          </button>
        </div>
      </div>
    </>
  );
}

function CreateSkill(props) {
  const intl = useIntl();
  const [data, setData] = useState<{ skill: string }>();

  const clearData = () => {
    setData({
      skill: "",
    });
  };

  // Validate for Company
  const isValidSkill = data?.skill?.length > 3 && data?.skill?.length < 100;

  // Create a new post in supabase postgres
  const createSkill = async () => {
    if (!data) return;

    let { data: experiences, error: experiencesSelectError } = await supaClient
      .from("experiences")
      .select("skills")
      .eq("id", props.experienceId);

    const [experienceSkill] = experiences;
    let { skills: experienceSkills } = experienceSkill;

    const { data: supaData, error: experiencesUpdateError } = await supaClient
      .from("experiences")
      .update({
        skills: experienceSkills
          ? [...experienceSkills, data?.skill]
          : [data?.skill],
      })
      .eq("id", props.experienceId);

    toast.success(intl.formatMessage({
      id: 'profile-skill-created',
      description: 'Skill successfully created message',
      defaultMessage: 'Skill successfully created'
    }));
  };

  const clearSkill = async (e) => {
    e.preventDefault();
    clearData();
  };

  return (
    <>
      <div className="flex flex-col gap-2 my-4 px-4 py-2 bg-blog-white card--white">
        <JsonForms
          schema={skillSchema}
          uischema={uiSkillSchema}
          data={data}
          renderers={materialRenderers}
          cells={materialCells}
          onChange={({ errors, data }) => setData(data)}
        />

        <div className="flex self-center gap-2">
          <button
            type="submit"
            disabled={!isValidSkill}
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
            onClick={() => createSkill()}
          >
            <FormattedMessage
              id="profile-create-skill-button"
              description="Create skill button"
              defaultMessage="Create"
            />
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
            onClick={clearSkill}
          >
            <FormattedMessage
              id="profile-cancel-skill-button"
              description="Cancel skill button"
              defaultMessage="Cancel"
            />
          </button>
        </div>
      </div>
    </>
  );
}

function DisplaySkillChips(props) {
  const [displaySkills, setDisplaySkills] = useState<string[]>([]);

  useEffect(() => {
    getSkills();
  }, []);

  async function getSkills() {
    let { data: experiences, error } = await supaClient
      .from("experiences")
      .select("skills")
      .eq("id", props.experienceId);

    const [experienceSkill] = experiences;
    const { skills } = experienceSkill;
    setDisplaySkills(skills);
  }
  return (
    <>
      <div className="flex flex-wrap gap-2 my-4 px-4 py-2">
        {displaySkills &&
          displaySkills.map((_value, index) => {
            return (
              <>
                <div key={index}>
                  <Chip label={_value} color="primary" />
                </div>
              </>
            );
          })}
      </div>
    </>
  );
}

export default Profile;
