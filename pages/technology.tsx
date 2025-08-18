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
  faBolt,
  faFire,
  faStar,
  faMagicWandSparkles,
  faInfinity,
  faChevronDown,
  faPlay,
  faPause,
  faEye,
  faHeart,
  faZap,
  faGem,
  faDna,
  faWaveSquare,
  faBrain,
  faSatelliteDish,
  faMicrochip,
  faNetworkWired
} from "@fortawesome/free-solid-svg-icons";

// Components
import Metatags from "../components/Metatags";

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
    props: { techStackState, leadingTechState },
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
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cybernetics' | 'network' | 'software' | 'hardware' | 'data'>('all');
  const [isAnimating, setIsAnimating] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTech, setActiveTech] = useState(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ 
        x: (e.clientX / window.innerWidth - 0.5) * 50,
        y: (e.clientY / window.innerHeight - 0.5) * 50
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Cyberpunk category system
  const techSectors = [
    { 
      id: 'all', 
      label: 'All Sectors', 
      icon: faGlobe, 
      color: 'from-cyan-400 to-blue-500',
      description: 'View all technologies'
    },
    { 
      id: 'cybernetics', 
      label: 'Cybernetics', 
      icon: faBrain, 
      color: 'from-pink-500 to-purple-600',
      description: 'AI & Machine Learning'
    },
    { 
      id: 'network', 
      label: 'Network', 
      icon: faNetworkWired, 
      color: 'from-blue-400 to-indigo-500',
      description: 'Cloud & Infrastructure'
    },
    { 
      id: 'software', 
      label: 'Software', 
      icon: faCode, 
      color: 'from-green-400 to-teal-500',
      description: 'Apps & Frameworks'
    },
    { 
      id: 'hardware', 
      label: 'Hardware', 
      icon: faMicrochip, 
      color: 'from-orange-400 to-red-500',
      description: 'Physical Components'
    },
    { 
      id: 'data', 
      label: 'Data', 
      icon: faSatelliteDish, 
      color: 'from-yellow-400 to-orange-500',
      description: 'Databases & Storage'
    }
  ];

  const getFilteredTechnologies = () => {
    if (selectedCategory === 'all') return techStackState;
    
    const keywords = {
      cybernetics: 'ai|ml|tensorflow|pytorch|neural|machine|learning|gpt|llm',
      network: 'aws|azure|gcp|docker|kubernetes|serverless|cloud|microservice|nginx|apache',
      software: 'react|vue|angular|next|svelte|html|css|javascript|typescript|node|python|java|go|rust|express',
      hardware: 'raspberry|arduino|nvidia|intel|amd|iot',
      data: 'mysql|postgres|mongo|redis|firebase|supabase|sqlite|kafka|hadoop|spark'
    };
    
    const pattern = keywords[selectedCategory];
    return techStackState?.filter(tech => 
      new RegExp(pattern, 'i').test(tech.name)
    );
  };

  // Create New Tech Stack Function
  const createTechStack = async () => {
    if (data && data.color && data.name) {
      try {
        const response = await fetch("/api/techstack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            color: data.color,
            name: data.name,
            uid: profile?.id
          })
        });

        if (response.ok) {
          const newTech = await response.json();
          setTechStackState(prev => [...(prev || []), newTech]);
          toast.success(intl.formatMessage({
            id: "technology-create-success-cyber",
            description: "Technology created successfully",
            defaultMessage: "Technology integrated into the grid!"
          }));
          setData({});
        }
      } catch (error) {
        toast.error(intl.formatMessage({
          id: "technology-create-error-cyber", 
          description: "Error creating technology",
          defaultMessage: "Grid connection unstable"
        }));
      }
    }
  };

  const [data, setData] = useState<any>({});

  function CyberDeckCreator() {
    return (
      <div className="relative bg-black/80 backdrop-blur-md rounded-lg p-6 border border-cyan-400/30 shadow-lg shadow-cyan-500/20">
        <div className="absolute top-2 right-2 text-xs text-cyan-400 font-mono">SYS_ADMIN</div>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-cyan-400 font-mono glitch" data-text="TECH FABRICATOR">
            TECH FABRICATOR
          </h3>
          <p className="text-sm text-cyan-200">
            <FormattedMessage
              id="technology-cyber-creator-subtitle"
              description="Cyber creator subtitle"
              defaultMessage="Fabricate new tech entities"
            />
          </p>
        </div>

        <div className="bg-black/70 rounded p-4 mb-4 border border-cyan-400/20">
          <JsonForms
            schema={schema}
            uischema={uischema}
            data={data}
            renderers={materialRenderers}
            cells={materialCells}
            onChange={({ errors, data }) => setData(data)}
          />
        </div>

        <div className="flex justify-center gap-4">
          <button
            className="cyber-button"
            onClick={createTechStack}
          >
            <FormattedMessage
              id="technology-fabricate-button"
              description="Fabricate button"
              defaultMessage="Fabricate"
            />
          </button>
          <button
            className="cyber-button-secondary"
            onClick={() => setData({})}
          >
            <FormattedMessage
              id="technology-clear-button"
              description="Clear button"
              defaultMessage="Clear"
            />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Metatags
        title={intl.formatMessage({
          id: "technology-page-title-cyber",
          description: "Cyberpunk technology page title",
          defaultMessage: "Tech Grid 2077"
        })}
        description={intl.formatMessage({
          id: "technology-page-description-cyber", 
          description: "Cyberpunk technology page description",
          defaultMessage: "Explore the high-tech, low-life world of modern technology"
        })}
      />

      {/* Cyberpunk Background */}
      <div className="fixed inset-0 bg-black overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-cyan"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
        <div 
          className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent transition-all duration-1000"
          style={{
            left: `${20 + mousePosition.x / 5}%`,
            top: `${30 + mousePosition.y / 5}%`,
          }}
        ></div>
      </div>

      <div className="relative min-h-screen text-white overflow-x-hidden">
        <div className="container mx-auto px-4 py-8 relative z-10">

          {/* CyberDeck Creator for authenticated users */}
          {profile?.id && (
            <div className="mb-20">
              <CyberDeckCreator />
            </div>
          )}

          {/* Glitch Hero Section */}
          <div className="text-center mb-20 relative h-64 flex items-center justify-center">
            <h1 className="text-7xl md:text-9xl font-black font-mono uppercase glitch" data-text="TECH GRID">
              TECH GRID
            </h1>
            <div className="absolute bottom-0 text-lg text-cyan-400">
              <FormattedMessage
                id="technology-cyber-hero-subtitle"
                description="Cyberpunk hero subtitle"
                defaultMessage="High Tech, Low Life"
              />
            </div>
          </div>

          {/* Sector Navigation */}
          <div className="mb-16">
            <div className="flex flex-wrap justify-center gap-4">
              {techSectors.map((sector) => (
                <button
                  key={sector.id}
                  onClick={() => setSelectedCategory(sector.id as any)}
                  className={`cyber-sector-button ${selectedCategory === sector.id ? 'active' : ''}`}
                >
                  <FontAwesomeIcon icon={sector.icon} className="mr-2" />
                  {sector.label}
                </button>
              ))}
            </div>
          </div>

          {/* Data Stream Tech Display */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold font-mono text-pink-500 glitch" data-text="DATA STREAM">
                DATA STREAM
              </h2>
              <p className="text-cyan-200">
                <FormattedMessage
                  id="technology-data-stream-subtitle"
                  description="Data stream subtitle"
                  defaultMessage="Live feed of available technologies"
                />
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredTechnologies()?.map(({ id, tech_color: colorTechStack, name: techName }, index) => (
                <DataStreamCard
                  key={id}
                  techStackName={techName}
                  techStackColor={colorTechStack}
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* Bounty Board for Leading Technologies */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold font-mono text-yellow-400 glitch" data-text="BOUNTY BOARD">
                BOUNTY BOARD
              </h2>
              <p className="text-cyan-200">
                <FormattedMessage
                  id="technology-bounty-board-subtitle"
                  description="Bounty board subtitle"
                  defaultMessage="Most wanted technologies"
                />
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {leadingTechState?.map(({ id, tech_color: colorTechStack, name: techName }, index) => (
                <BountyCard
                  key={id}
                  techStackName={techName}
                  techStackColor={colorTechStack}
                  index={index}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// Data Stream Card Component
function DataStreamCard({ techStackName, techStackColor, index }) {
  return (
    <div className="data-stream-card">
      <div className="data-stream-card-header">
        <span className="font-mono text-xs">ID: {index.toString().padStart(3, '0')}</span>
        <span className="font-mono text-xs text-green-400">ONLINE</span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-cyan-400">{techStackName}</h3>
      </div>
      <div className="data-stream-card-footer">
        <div className="w-full bg-cyan-900 h-1">
          <div className="bg-cyan-400 h-1" style={{ width: `${(index * 10) % 100}%` }}></div>
        </div>
      </div>
    </div>
  );
}

// Bounty Card Component
function BountyCard({ techStackName, techStackColor, index }) {
  return (
    <div className="bounty-card">
      <div className="bounty-card-header">
        <h3 className="text-xl font-bold text-yellow-400 font-mono">{techStackName}</h3>
        <div className="text-yellow-400">
          <FontAwesomeIcon icon={faStar} />
          <FontAwesomeIcon icon={faStar} />
          <FontAwesomeIcon icon={faStar} />
        </div>
      </div>
      <div className="p-4 text-sm text-yellow-200">
        <p>
          <FormattedMessage
            id="technology-bounty-description"
            description="Bounty description"
            defaultMessage="High-value target. Essential for core system operations. Handle with care."
          />
        </p>
      </div>
      <div className="bounty-card-footer">
        <span className="font-mono text-xs">REWARD: {(index + 1) * 1000} CREDITS</span>
      </div>
    </div>
  );
}
