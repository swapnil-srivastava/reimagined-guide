import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import moment from "moment";

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
import { SupashipUserInfo } from "../lib/hooks";

import Metatags from "../components/Metatags";
import { IntlProvider } from "react-intl";

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

    setExperiences([
      {
        id: "5a2d82bb-02c7-4382-a6f5-8986af3a4b38",
        created_at: "2023-04-03T20:10:36.339778+00:00",
        company: "HCL Tech Gmbh.",
        location: "Frankfurt am Main, Germany",
        position: "Lead Consultant",
        position_description:
          "Here I successfully became team leader for a new SaaS platform development project using ING-WEB (lit-element), Spring, and Azure technologies. Implemented Agile methodologies, improved code efficiency, and actively mentored junior developers. Also had experience with Azure services and monitoring/logging tools and demonstrated the ability to work under pressure and meet tight deadlines with high quality.\n\n•Leading a team of 9 developers in the design and development of a new SaaS platform using Ing-Web(lit-html), Spring, and Azure technologies and improved project delivery with Agile methodologies, resulting in a 30% increase in productivity.\n•Improved code efficiency by 15% through the implementation of best practices and optimization techniques such as code refactoring, automated testing, snapshot testing and continuous integration/deployment (CI/CD), led the team to achieve a high successful delivery rate, and actively mentored junior developers, resulting in a 20% improvement in team skills and increased retention rate.\n•Led the team to achieve a 95% successful delivery rate on all projects, resulting in a 50% increase in customer satisfaction.\n•Worked closely with stakeholders to gather requirements and ensure that the platform met the needs of the business by conducting user research, usability testing and incorporating feedback.\n",
        isPresent: true,
        position_start_time: "2022-06-30T22:00:00+00:00",
        position_end_time: null,
      },
      {
        id: "7b3b5fb8-89f3-494b-9d68-861ff9dfc5e2",
        created_at: "2023-04-03T21:08:46.715618+00:00",
        company: "HCL Tech Gmbh",
        location: "Frankfurt am Main, Germany",
        position: "Senior Software Consultant",
        position_description:
          "Here, I manage frontend developer teams and collaborate with developers, product and account managers, and DevOps and systems engineers. This involves determining project requirements, devising completion estimates and timelines, and overseeing deployments and new releases. I debug code and document work and draft reports. Ultimately, I ensure each project is delivered on time and within budget in accordance with Agile methodologies.\n\nSome of my recent accomplishments are:\n• Creating a Blueprint framework for a kitchen sink application and a reusable component, shrinking the frontend development time from 4 weeks to one day.\n• Organizing the first online hackathon in ING Germany (TAGthon and TAGthon2) and HerHackathon2022 \non Azure Public Cloud using the Static web app, app services, and Kubernetes cluster.\n• Redesigning Azure pipelines and reducing the timeline from 45 to 5 minutes.",
        isPresent: false,
        position_start_time: "2020-03-09T08:00:00+00:00",
        position_end_time: "2022-07-31T21:59:59+00:00",
      },
      {
        id: "824f5161-ba0a-4e73-aa2c-696f536dc870",
        created_at: "2023-04-03T21:11:14.447568+00:00",
        company: "IBM",
        location: "Bengaluru, India",
        position: "Application Developer",
        position_description:
          "For IBM, I worked on the projects listed below.\n\nI have designed and developed RESTful APIs using Spring Boot, Spring Data JPA, and Hibernate. I have also fixed major architectural bugs and implemented process improvements to enhance pipeline efficiency. Additionally, I have utilized a variety of frontend technologies, such as Angular, NgRx, Jest, MomentJS, Chocolatey, Homebrew, React Native, Redux Saga, and Redux Offline to create seamless user experiences.\n\nMy contributions at Kawasaki include:\n•Created Kawasaki Native app which reduced the paperwork for buying product by 80%.\n•Designed and developed RESTful APIs using Spring Boot framework to create scalable and high-performance web applications. \n•Utilized Spring Data JPA to interact with databases and perform data operations. \n•Implemented error handling mechanisms in the APIs to provide better user experience and detect and fix errors quickly.\n•Pitched the idea to use React Native for the creation of the app for android and iOS platform. \n•Delivered app within timeline, which brought 40% to 50% growth in sales to Kawasaki stakeholder. \n\nAt Markel Insurance Corp. GRS:\n•Spearheaded key technical projects, including creation of innovative GRS Dashboard using FRMS. \n•Leveraged Spring Data to interact with relational and non-relational databases, optimizing performance and minimizing boilerplate code.\n•Used Spring Boot to create a robust and scalable RESTful API, implementing industry best practices for security, data validation, and error handling.\n•Conducted load testing and performance optimization on the RESTful API, leveraging caching, compression, and connection pooling techniques to improve response times and throughput.\n•Fixed major architectural bugs using Angular Form Control and communication between Angular modules using ngRx. \n•Refactored code and implemented front-end process improvements to refine pipeline efficiency by 40%.",
        isPresent: false,
        position_start_time: "2019-03-04T11:00:00+00:00",
        position_end_time: "2020-03-02T11:00:00+00:00",
      },
      {
        id: "e581671c-6f3d-402c-8e67-eae2ca0348d4",
        created_at: "2023-04-03T21:13:36.549851+00:00",
        company: "L & T Technology Services",
        location: "Bengaluru, India",
        position: "Senior Software Engineer",
        position_description:
          "Here I organized and led and mentored teams to improve code quality and stability while implementing new functionalities and making improvements to existing architecture. My experience includes overseeing the development and launch of HomeCare health app in new markets, developing and maintaining multiple microservices with Docker and Kubernetes, and creating Python and R scripts for information storage and sharing at Health Suits Insight.\n\nSome of my notable projects include\n\nFor HomeCo Japan:\n•Developed Auto Complete and Pagination features for an Angular app, improving user experience by 100%.\n•Implemented data validation and error handling to enhance API reliability and security.\n•Utilized Spring Data JPA and Hibernate to interact with relational databases.\n\nAt Clinical Data Lake (CDAL):\n•Led development of suite of CDAL microservices using Angular and Docker, decreasing pipeline efficiency from 50-minute to 5-minute runs.\n•Implemented Drag and Drop Functionality to improve scalability and increase user experience by 100%.\n•Developed API endpoints with custom request and response models using Spring Web and Spring MVC modules.\n\nFor Health Suits Insight (HSI):\n•Created Python and R scripts for information storage and sharing by data scientists using Workbench (Angular with ngRx).\n•Applied coding standards to decrease build size by 200% and implemented search features of text files to improve app usability by 100%.\nFor Eaton:\n•Integrated Angular JS, Angular material, Polymer 1.0, Polymer 2.0, and React Material-UI components using Eaton UI style guide.\n•Implemented the in-app translation feature.\n\nFor Exosite/Parker:\n•Developed the Sales Enablement, Education, and Development (SEED) training app for Apple retailers/partners using Angular JS and Angular 2.\n•Reduced repetition of software patterns using the DRY approach to build components used throughout the project.",
        isPresent: false,
        position_start_time: "2016-11-01T11:00:00+00:00",
        position_end_time: "2019-03-04T11:00:00+00:00",
      },
      {
        id: "e7dbe85a-e45e-436d-8358-a0194936b3f8",
        created_at: "2023-04-03T21:15:19.648432+00:00",
        company: "Software Paradigm Infotech",
        location: "Mysuru, India",
        position: "Associate Software Engineer",
        position_description:
          "Here, I designed and produced software interfaces using AngularJS. Prioritized user and business requirements within tech constraints using CSS pre-processing platforms LESS and SASS. Handled asynchronous requests, partial page updates, and AJAX. Implemented the UI changes as per UX Design and requirement of the Stakeholders. \n• Used AngularJS template-driven forms for address update upon login for stakeholder website\n• Implemented the banners of ecommerce website burketoutlet.com using flex layout and DRY approach to inject component throughout website.",
        isPresent: false,
        position_start_time: "2014-04-01T10:00:00+00:00",
        position_end_time: "2016-10-31T11:00:00+00:00",
      },
    ]);
  }

  return (
    <>
      <Metatags
        title={"Swapnil Srivastava's Profile"}
        description={"Here is the list of experiences"}
      />
      <div className="m-4">
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
                  <Typography
                    sx={{ width: "33%", flexShrink: 0 }}
                    className="font-bold"
                  >
                    {company}
                  </Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    {moment(position_start_time).format("MMM YYYY")} -{" "}
                    {isPresent
                      ? "Present"
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
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography className="font-bold">{position}</Typography>
                  <Typography className="font-bold">{location}</Typography>
                  <Typography className="whitespace-pre-wrap">
                    {position_description}
                    <CreateSkill experienceId={id} />
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

function CreateSkill(props) {
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

    const [experienceSkill] = [{ skills: null }];
    let { skills: experienceSkills } = experienceSkill;
    experienceSkills;

    const { data: supaData, error: experiencesUpdateError } = await supaClient
      .from("experiences")
      .update({
        skills: experienceSkills
          ? [...experienceSkills, data?.skill]
          : [data?.skill],
      })
      .eq("id", props.experienceId);

    toast.success("Skill Succesfully Created");
  };

  const clearSkill = async (e) => {
    e.preventDefault();
    clearData();
  };

  return (
    <>
      <div className="flex flex-col gap-2 my-4 px-4 py-2 text-blog-black dark:bg-blog-white">
        <JsonForms
          schema={skillSchema}
          uischema={uiSkillSchema}
          data={data}
          renderers={materialRenderers}
          cells={materialCells}
          onChange={({ errors, data }) => setData(data)}
        />

        <pre>{JSON.stringify(data)}</pre>

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
            onClick={clearSkill}
          >
            Cancel
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

    const [experienceSkill] = [{ skills: null }];
    const { skills } = experienceSkill;
    setDisplaySkills(skills);
  }
  return (
    <>
      <pre>{JSON.stringify(displaySkills)}</pre>
      <div className="flex gap-2 my-4 px-4 py-2">
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
