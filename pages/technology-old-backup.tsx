import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useIntl, FormattedMessage } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faRocket, 
  faLightbulb, 
  faCog, 
  faCode, 
  faAtom, 
  faMagic,
  faGlobe,
  faCube,
  faFlask,
  faBolt
} from "@fortawesome/free-solid-svg-icons";

// Components
import Metatags from "../components/Metatags";
import TechBox from "../components/TechBox";

// Local Interface
import { LEADINGTECH, TECHNOLOGIES } from "../database.types";
import { supaClient } from "../supa-client";
import { RootState } from "../lib/interfaces/interface";

// JSON Forms
import { JsonForms } from "@jsonforms/react";

// Technology Schema
import schema from "../lib/techStack/techStackSchema.json";
import uischema from "../lib/techStack/uiTechStackSchema.json";

import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";

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
  const intl = useIntl();
  const [techStackState, setTechStackState] = useState<TECHNOLOGIES[]>(
    props.techStackState
  );

  const [leadingTechState, setLeadingTechState] = useState<LEADINGTECH[]>(
    props.leadingTechState
  );
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'frontend' | 'backend' | 'database' | 'tools'>('all');
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  // Animation effect on category change
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  // Tech categories with icons
  const techCategories = [
    { id: 'all', icon: faGlobe, label: 'All Technologies' },
    { id: 'frontend', icon: faCode, label: 'Frontend' },
    { id: 'backend', icon: faCog, label: 'Backend' },
    { id: 'database', icon: faCube, label: 'Database' },
    { id: 'tools', icon: faFlask, label: 'Tools' }
  ];

  return (
    <>
      <Metatags />
      
      {/* Hero Section with Animated Background */}
      <div className="relative min-h-screen bg-blog-white dark:bg-fun-blue-500 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-fun-blue-500 to-hit-pink-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 right-10 w-96 h-96 bg-gradient-to-r from-caribbean-green-500 to-fun-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-gradient-to-r from-hit-pink-500 to-caribbean-green-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Floating Tech Icons */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 text-fun-blue-500 opacity-20 animate-bounce">
            <FontAwesomeIcon icon={faRocket} size="3x" />
          </div>
          <div className="absolute top-1/3 right-1/4 text-caribbean-green-500 opacity-20 animate-bounce delay-500">
            <FontAwesomeIcon icon={faAtom} size="2x" />
          </div>
          <div className="absolute bottom-1/3 left-1/6 text-hit-pink-500 opacity-20 animate-bounce delay-1000">
            <FontAwesomeIcon icon={faMagic} size="2x" />
          </div>
          <div className="absolute top-2/3 right-1/6 text-fun-blue-500 opacity-20 animate-bounce delay-1500">
            <FontAwesomeIcon icon={faBolt} size="2x" />
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16">
          {/* CREATE Tech Stack for authenticated users */}
          {profile?.id && (
            <div className="mb-16">
              <CreateNewTechStack />
            </div>
          )}

          {/* Hero Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-fun-blue-500 to-hit-pink-500 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faLightbulb} size="lg" className="text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-fun-blue-500 via-hit-pink-500 to-caribbean-green-500 bg-clip-text text-transparent">
                <FormattedMessage
                  id="technology-hero-title"
                  description="Technology hero title"
                  defaultMessage="Tech Arsenal"
                />
              </h1>
              <div className="w-12 h-12 bg-gradient-to-r from-caribbean-green-500 to-fun-blue-500 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faRocket} size="lg" className="text-white" />
              </div>
            </div>
            <p className="text-xl text-gray-800 dark:text-gray-300 max-w-3xl mx-auto">
              <FormattedMessage
                id="technology-hero-subtitle"
                description="Technology hero subtitle"
                defaultMessage="Explore the cutting-edge technologies that power innovation and creativity in modern development"
              />
            </p>
          </div>

          {/* Category Filter Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {techCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as any)}
                className={`
                  group relative px-6 py-3 rounded-full transition-all duration-300
                  ${selectedCategory === category.id 
                    ? 'bg-gradient-to-r from-fun-blue-500 to-hit-pink-500 shadow-lg transform scale-105' 
                    : 'bg-white dark:bg-gray-800 shadow-md hover:shadow-lg hover:transform hover:scale-105 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon 
                    icon={category.icon} 
                    className={`
                      transition-all duration-300
                      ${selectedCategory === category.id ? 'text-white' : 'text-fun-blue-500 dark:text-hit-pink-500 group-hover:text-hit-pink-500 dark:group-hover:text-caribbean-green-500'}
                    `}
                  />
                  <span className={`
                    font-medium transition-all duration-300
                    ${selectedCategory === category.id ? 'text-white' : 'text-gray-700 dark:text-gray-300'}
                  `}>
                    <FormattedMessage
                      id={`technology-category-${category.id}`}
                      description={`Category: ${category.label}`}
                      defaultMessage={category.label}
                    />
                  </span>
                </div>
                {selectedCategory === category.id && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-fun-blue-500 to-hit-pink-500 opacity-20 animate-pulse"></div>
                )}
              </button>
            ))}
          </div>

          {/* Leading Technologies Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faAtom} className="text-white" />
                </div>
                <h2 className="text-4xl font-bold text-black dark:text-white">
                  <FormattedMessage
                    id="technology-leading-tech-title"
                    description="Leading Tech section title"
                    defaultMessage="Leading Technologies"
                  />
                </h2>
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faBolt} className="text-white" />
                </div>
              </div>
              <p className="text-gray-800 dark:text-gray-300">
                <FormattedMessage
                  id="technology-leading-tech-subtitle"
                  description="Leading tech subtitle"
                  defaultMessage="The pioneering technologies that define the future of development"
                />
              </p>
            </div>

            <div 
              ref={containerRef}
              className={`
                grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6
                transition-all duration-500 ease-in-out
                ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}
              `}
            >
              {leadingTechState?.map(({ id, tech_color: colorTechStack, name: techName }, index) => (
                <div 
                  key={id}
                  className="transform transition-all duration-300 hover:scale-110 hover:rotate-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <EnhancedTechBox
                    techStackName={techName}
                    techStackColor={colorTechStack}
                    isLeading={true}
                    index={index}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faCog} className="text-white" />
                </div>
                <h2 className="text-4xl font-bold text-black dark:text-white">
                  <FormattedMessage
                    id="technology-tech-stack-title"
                    description="Tech Stack section title"
                    defaultMessage="Technology Stack"
                  />
                </h2>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faCode} className="text-white" />
                </div>
              </div>
              <p className="text-gray-800 dark:text-gray-300">
                <FormattedMessage
                  id="technology-tech-stack-subtitle"
                  description="Tech stack subtitle"
                  defaultMessage="The comprehensive toolkit for building exceptional digital experiences"
                />
              </p>
            </div>

            <div 
              className={`
                grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4
                transition-all duration-500 ease-in-out
                ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}
              `}
            >
              {techStackState?.map(({ id, tech_color: colorTechStack, name: techName }, index) => (
                <div 
                  key={id}
                  className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <EnhancedTechBox
                    techStackName={techName}
                    techStackColor={colorTechStack}
                    isLeading={false}
                    index={index}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Innovation Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-fun-blue-500/10 to-hit-pink-500/10 border border-fun-blue-500/20 hover:border-fun-blue-500/40 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-fun-blue-500 to-hit-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faRocket} size="2x" className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">
                {leadingTechState?.length || 0}
              </h3>
              <p className="text-gray-800 dark:text-gray-300">
                <FormattedMessage
                  id="technology-stats-leading"
                  description="Leading technologies count"
                  defaultMessage="Leading Technologies"
                />
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-caribbean-green-500/10 to-fun-blue-500/10 border border-caribbean-green-500/20 hover:border-caribbean-green-500/40 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-caribbean-green-500 to-fun-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faCube} size="2x" className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">
                {techStackState?.length || 0}
              </h3>
              <p className="text-gray-800 dark:text-gray-300">
                <FormattedMessage
                  id="technology-stats-total"
                  description="Total technologies count"
                  defaultMessage="Total Technologies"
                />
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-hit-pink-500/10 to-caribbean-green-500/10 border border-hit-pink-500/20 hover:border-hit-pink-500/40 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-hit-pink-500 to-caribbean-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faLightbulb} size="2x" className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">
                <FormattedMessage
                  id="technology-stats-innovation"
                  description="Innovation level"
                  defaultMessage="100%"
                />
              </h3>
              <p className="text-gray-800 dark:text-gray-300">
                <FormattedMessage
                  id="technology-stats-innovation-label"
                  description="Innovation level label"
                  defaultMessage="Innovation Level"
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Enhanced TechBox Component with 3D effects and animations
function EnhancedTechBox({ 
  techStackName, 
  techStackColor, 
  isLeading, 
  index 
}: { 
  techStackName: string; 
  techStackColor: string; 
  isLeading: boolean;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Get a random gradient based on the tech name
  const getGradient = () => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-purple-500 to-pink-600',
      'from-pink-500 to-red-600',
      'from-red-500 to-orange-600',
      'from-orange-500 to-yellow-600',
      'from-yellow-500 to-green-600',
      'from-green-500 to-teal-600',
      'from-teal-500 to-cyan-600',
      'from-cyan-500 to-blue-600',
      'from-indigo-500 to-purple-600'
    ];
    return gradients[index % gradients.length];
  };

  // Get tech icon based on tech name
  const getTechIcon = () => {
    const name = techStackName.toLowerCase();
    if (name.includes('react') || name.includes('next') || name.includes('vue')) return faCode;
    if (name.includes('node') || name.includes('express') || name.includes('nest')) return faCog;
    if (name.includes('database') || name.includes('mongo') || name.includes('sql')) return faCube;
    if (name.includes('docker') || name.includes('git') || name.includes('test')) return faFlask;
    return faAtom;
  };

  return (
    <div
      className={`
        group relative overflow-hidden
        ${isLeading ? 'h-32 w-full' : 'h-28 w-full'} 
        rounded-2xl cursor-pointer
        transform transition-all duration-500 ease-out
        ${isHovered ? 'scale-110 -rotate-1' : 'scale-100'}
        hover:shadow-2xl hover:shadow-fun-blue-500/25
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Gradient */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${techStackColor || getGradient()}
        transition-all duration-500
        ${isHovered ? 'scale-110' : 'scale-100'}
      `} />
      
      {/* Overlay Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      
      {/* Shine Effect */}
      <div className={`
        absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
        transform -skew-x-12 transition-transform duration-700
        ${isHovered ? 'translate-x-full' : '-translate-x-full'}
      `} />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-4 text-white">
        {/* Tech Icon */}
        <div className={`
          mb-2 transition-all duration-300
          ${isHovered ? 'scale-125 rotate-12' : 'scale-100'}
        `}>
          <FontAwesomeIcon 
            icon={getTechIcon()} 
            size={isLeading ? "2x" : "lg"} 
            className="drop-shadow-lg" 
          />
        </div>
        
        {/* Tech Name */}
        <div className={`
          text-center font-bold text-white drop-shadow-lg
          ${isLeading ? 'text-lg' : 'text-sm'}
          ${isHovered ? 'scale-110' : 'scale-100'}
          transition-all duration-300
        `}>
          {techStackName}
        </div>

        {/* Leading Badge */}
        {isLeading && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faBolt} size="xs" className="text-yellow-800" />
            </div>
          </div>
        )}

        {/* Floating Particles */}
        {isHovered && (
          <>
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/60 rounded-full animate-ping" />
            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/40 rounded-full animate-ping delay-300" />
            <div className="absolute bottom-1/4 left-3/4 w-1.5 h-1.5 bg-white/50 rounded-full animate-ping delay-500" />
          </>
        )}
      </div>

      {/* Bottom Glow */}
      <div className={`
        absolute bottom-0 left-1/2 transform -translate-x-1/2
        w-3/4 h-1 bg-gradient-to-r ${techStackColor || getGradient()}
        blur-sm transition-all duration-300
        ${isHovered ? 'h-2 w-full' : 'h-1 w-3/4'}
      `} />
    </div>
  );
}

interface TechStackJSON {
  tech_stack_name: string;
  tech_stack_css: string;
  toggle: boolean;
}

function CreateNewTechStack() {
  const intl = useIntl();
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
      data?.toggle 
        ? intl.formatMessage({
            id: 'technology-tech-stack-created',
            description: 'Tech stack created success message',
            defaultMessage: 'Tech Stack created!'
          })
        : intl.formatMessage({
            id: 'technology-leading-tech-created',
            description: 'Leading tech stack created success message',
            defaultMessage: 'Leading Tech Stack created'
          })
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
            <FormattedMessage
              id="technology-create-button"
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
            onClick={clearTechStack}
          >
            <FormattedMessage
              id="technology-cancel-button"
              description="Cancel button"
              defaultMessage="Cancel"
            />
          </button>
        </div>
      </div>
    </>
  );
}
