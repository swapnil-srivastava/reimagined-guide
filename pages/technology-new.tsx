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
  faSparkles,
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
  faBrain
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
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'cloud' | 'frontend' | 'backend' | 'quantum'>('all');
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<'galaxy' | 'neural' | 'matrix' | 'hologram'>('galaxy');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [galaxyRotation, setGalaxyRotation] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTech, setActiveTech] = useState(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  // Mouse tracking for 3D effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ 
        x: (e.clientX / window.innerWidth - 0.5) * 100,
        y: (e.clientY / window.innerHeight - 0.5) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-rotation for galaxy view
  useEffect(() => {
    if (!isAutoRotating || activeViewMode !== 'galaxy') return;
    
    const interval = setInterval(() => {
      setGalaxyRotation(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [isAutoRotating, activeViewMode]);

  // Revolutionary category system
  const techRealms = [
    { 
      id: 'all', 
      label: 'Multiverse', 
      icon: faInfinity, 
      color: 'from-purple-600 via-blue-500 to-cyan-400',
      description: 'All realities converge'
    },
    { 
      id: 'ai', 
      label: 'Neural Core', 
      icon: faBrain, 
      color: 'from-pink-500 via-red-500 to-orange-400',
      description: 'Intelligence amplified'
    },
    { 
      id: 'cloud', 
      label: 'Quantum Cloud', 
      icon: faAtom, 
      color: 'from-blue-400 via-purple-500 to-indigo-600',
      description: 'Infinite scale'
    },
    { 
      id: 'frontend', 
      label: 'Reality Engine', 
      icon: faEye, 
      color: 'from-green-400 via-teal-500 to-blue-500',
      description: 'Experience crafting'
    },
    { 
      id: 'backend', 
      label: 'Core Matrix', 
      icon: faDna, 
      color: 'from-orange-400 via-red-500 to-pink-500',
      description: 'System architecture'
    },
    { 
      id: 'quantum', 
      label: 'Quantum Realm', 
      icon: faGem, 
      color: 'from-indigo-500 via-purple-600 to-pink-500',
      description: 'Beyond possibilities'
    }
  ];

  const viewModes = [
    { 
      id: 'galaxy', 
      label: 'Galaxy View', 
      icon: faGlobe,
      description: 'Cosmic perspective'
    },
    { 
      id: 'neural', 
      label: 'Neural Network', 
      icon: faBrain,
      description: 'AI consciousness'
    },
    { 
      id: 'matrix', 
      label: 'Code Matrix', 
      icon: faWaveSquare,
      description: 'Digital reality'
    },
    { 
      id: 'hologram', 
      label: 'Holographic', 
      icon: faSparkles,
      description: '3D projection'
    }
  ];

  const getFilteredTechnologies = () => {
    if (selectedCategory === 'all') return techStackState;
    
    const keywords = {
      ai: 'ai|ml|tensorflow|pytorch|neural|machine|learning|gpt|llm',
      cloud: 'aws|azure|gcp|docker|kubernetes|serverless|cloud|microservice',
      frontend: 'react|vue|angular|next|svelte|html|css|javascript|typescript',
      backend: 'node|python|java|go|rust|api|server|database|express',
      quantum: 'quantum|blockchain|crypto|web3|decentralized|smart|contract'
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
            id: "technology-create-success",
            description: "Technology created successfully",
            defaultMessage: "Technology uploaded to the matrix!"
          }));
          setData({});
        }
      } catch (error) {
        toast.error(intl.formatMessage({
          id: "technology-create-error", 
          description: "Error creating technology",
          defaultMessage: "Matrix connection failed"
        }));
      }
    }
  };

  const [data, setData] = useState({});

  function QuantumTechCreator() {
    return (
      <div className="relative bg-gradient-to-br from-black/90 via-purple-900/80 to-blue-900/80 backdrop-blur-2xl rounded-3xl p-8 border border-purple-500/30 shadow-2xl overflow-hidden">
        {/* Animated Circuit Background */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full">
            <defs>
              <pattern id="circuit" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 20h40M20 0v40" stroke="currentColor" strokeWidth="0.5" className="text-purple-400"/>
                <circle cx="20" cy="20" r="2" fill="currentColor" className="text-cyan-400"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)"/>
          </svg>
        </div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center animate-pulse">
                <FontAwesomeIcon icon={faAtom} size="lg" className="text-white" />
              </div>
              <h3 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                <FormattedMessage
                  id="technology-quantum-creator-title"
                  description="Quantum creator title"
                  defaultMessage="Quantum Tech Synthesizer"
                />
              </h3>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center animate-pulse">
                <FontAwesomeIcon icon={faSparkles} size="lg" className="text-white" />
              </div>
            </div>
            <p className="text-purple-200">
              <FormattedMessage
                id="technology-quantum-creator-subtitle"
                description="Quantum creator subtitle"
                defaultMessage="Manifest new technologies into the digital multiverse"
              />
            </p>
          </div>

          <div className="bg-black/50 rounded-2xl p-6 mb-6 border border-purple-500/20">
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
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 overflow-hidden"
              onClick={createTechStack}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <FontAwesomeIcon icon={faZap} className="animate-pulse" />
                <FormattedMessage
                  id="technology-synthesize-button"
                  description="Synthesize button"
                  defaultMessage="Synthesize"
                />
              </div>
            </button>
            <button
              className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-gray-500/30 transform hover:scale-105 transition-all duration-300"
              onClick={() => setData({})}
            >
              <FormattedMessage
                id="technology-reset-button"
                description="Reset button"
                defaultMessage="Reset Matrix"
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Metatags
        title={intl.formatMessage({
          id: "technology-page-title-new",
          description: "New technology page title",
          defaultMessage: "TECH∞ - Digital Multiverse Explorer"
        })}
        description={intl.formatMessage({
          id: "technology-page-description-new", 
          description: "New technology page description",
          defaultMessage: "Journey through infinite dimensions of technological innovation"
        })}
      />

      {/* Immersive Background Universe */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Cosmic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/30 to-blue-900/50"></div>
        
        {/* Animated Stars */}
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          >
            <div 
              className="bg-white rounded-full"
              style={{
                width: `${1 + Math.random() * 3}px`,
                height: `${1 + Math.random() * 3}px`
              }}
            ></div>
          </div>
        ))}

        {/* Nebula Effects */}
        <div 
          className="absolute w-96 h-96 bg-gradient-radial from-purple-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl transition-all duration-1000"
          style={{
            left: `${50 + mousePosition.x / 10}%`,
            top: `${30 + mousePosition.y / 10}%`,
          }}
        ></div>
        <div 
          className="absolute w-72 h-72 bg-gradient-radial from-cyan-400/15 via-purple-400/10 to-transparent rounded-full blur-2xl transition-all duration-1500"
          style={{
            right: `${30 - mousePosition.x / 15}%`,
            bottom: `${20 - mousePosition.y / 15}%`,
          }}
        ></div>

        {/* Quantum Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          >
            <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-30"></div>
          </div>
        ))}
      </div>

      <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white overflow-hidden">
        <div className="container mx-auto px-4 py-8 relative z-10">

          {/* Quantum Tech Creator for authenticated users */}
          {profile?.id && (
            <div className="mb-20">
              <QuantumTechCreator />
            </div>
          )}

          {/* Cosmic Command Center */}
          <div className="text-center mb-20 relative">
            {/* Rotating Tech Orbital */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[faRocket, faAtom, faBrain, faGem, faDna, faZap].map((icon, index) => (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    animation: `spin ${15 + index * 3}s linear infinite`,
                    transform: `rotate(${galaxyRotation + index * 60}deg) translateX(250px) rotate(-${galaxyRotation + index * 60}deg)`
                  }}
                >
                  <FontAwesomeIcon 
                    icon={icon} 
                    className="text-4xl text-purple-400/40 animate-pulse"
                  />
                </div>
              ))}
            </div>

            {/* Central Command Hub */}
            <div className="relative z-10 bg-gradient-to-br from-black/80 via-purple-900/70 to-blue-900/80 backdrop-blur-2xl rounded-3xl p-12 border border-purple-500/30 shadow-2xl">
              <div className="flex items-center justify-center gap-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                  <FontAwesomeIcon icon={faInfinity} size="2x" className="text-white" />
                </div>
                <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-purple-400 via-pink-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                  <FormattedMessage
                    id="technology-multiverse-title"
                    description="Multiverse title"
                    defaultMessage="TECH∞"
                  />
                </h1>
                <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                  <FontAwesomeIcon icon={faSparkles} size="2x" className="text-white animate-spin" />
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  <FormattedMessage
                    id="technology-multiverse-subtitle"
                    description="Multiverse subtitle"
                    defaultMessage="Digital Multiverse Explorer"
                  />
                </h2>
                <p className="text-xl text-purple-200 max-w-4xl mx-auto leading-relaxed">
                  <FormattedMessage
                    id="technology-multiverse-description"
                    description="Multiverse description"
                    defaultMessage="Navigate through infinite dimensions where technology transcends reality. Experience the convergence of AI, quantum computing, and digital consciousness."
                  />
                </p>
              </div>

              {/* View Mode Selector */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {viewModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setActiveViewMode(mode.id as any)}
                    className={`group relative overflow-hidden px-6 py-3 rounded-2xl transition-all duration-500 ${
                      activeViewMode === mode.id 
                        ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-2xl scale-110' 
                        : 'bg-white/10 backdrop-blur-sm text-purple-200 hover:scale-105 hover:bg-white/20'
                    }`}
                  >
                    <div className="relative flex items-center gap-2">
                      <FontAwesomeIcon 
                        icon={mode.icon} 
                        className={`transition-all duration-300 ${
                          activeViewMode === mode.id ? 'text-white animate-pulse' : 'text-purple-400'
                        }`}
                      />
                      <span className="font-bold">{mode.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Auto-rotation toggle */}
              <div className="flex justify-center mb-8">
                <button
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600/50 to-cyan-500/50 backdrop-blur-sm rounded-full text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <FontAwesomeIcon icon={isAutoRotating ? faPause : faPlay} />
                  <span className="font-medium">
                    {isAutoRotating ? 'Pause Cosmos' : 'Activate Cosmos'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Revolutionary Realm Navigation */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                <FormattedMessage
                  id="technology-realm-navigation"
                  description="Realm navigation title"
                  defaultMessage="Reality Realms"
                />
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {techRealms.map((realm) => (
                <button
                  key={realm.id}
                  onClick={() => setSelectedCategory(realm.id as any)}
                  className={`group relative overflow-hidden p-6 rounded-3xl transition-all duration-500 transform ${
                    selectedCategory === realm.id 
                      ? `bg-gradient-to-br ${realm.color} shadow-2xl scale-105 rotate-1` 
                      : 'bg-white/5 backdrop-blur-sm border border-purple-500/20 hover:scale-105 hover:bg-white/10'
                  }`}
                >
                  {/* Animated Background */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${realm.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                  
                  {/* Energy Ripples */}
                  {selectedCategory === realm.id && (
                    <div className="absolute inset-0 rounded-3xl">
                      <div className="absolute inset-2 border border-white/30 rounded-3xl animate-ping"></div>
                      <div className="absolute inset-4 border border-white/20 rounded-3xl animate-ping animation-delay-1000"></div>
                    </div>
                  )}
                  
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        selectedCategory === realm.id 
                          ? 'bg-white/20' 
                          : `bg-gradient-to-r ${realm.color}`
                      }`}>
                        <FontAwesomeIcon 
                          icon={realm.icon} 
                          size="2x" 
                          className={`${
                            selectedCategory === realm.id 
                              ? 'text-white animate-pulse' 
                              : 'text-white'
                          }`}
                        />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {realm.label}
                        </h3>
                        <p className="text-sm text-purple-200">
                          {realm.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dimensional Tech Display */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                <FormattedMessage
                  id="technology-dimensional-display"
                  description="Dimensional display title"
                  defaultMessage="Technology Constellation"
                />
              </h2>
              <p className="text-xl text-purple-200">
                <FormattedMessage
                  id="technology-dimensional-subtitle"
                  description="Dimensional display subtitle"
                  defaultMessage="Navigate through the quantum field of innovation"
                />
              </p>
            </div>

            {/* Dynamic Layout Based on View Mode */}
            <div 
              ref={containerRef}
              className={`
                transition-all duration-1000
                ${activeViewMode === 'galaxy' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6' : ''}
                ${activeViewMode === 'neural' ? 'flex flex-wrap justify-center gap-8' : ''}
                ${activeViewMode === 'matrix' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : ''}
                ${activeViewMode === 'hologram' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : ''}
              `}
              style={{
                perspective: '1000px',
                transform: activeViewMode === 'hologram' ? `rotateX(${mousePosition.y / 50}deg) rotateY(${mousePosition.x / 50}deg)` : 'none'
              }}
            >
              {getFilteredTechnologies()?.map(({ id, tech_color: colorTechStack, name: techName }, index) => (
                <div 
                  key={id}
                  className={`transform transition-all duration-700 ${
                    isAnimating ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
                  }`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <MultidimensionalTechCard
                    techStackName={techName}
                    techStackColor={colorTechStack}
                    viewMode={activeViewMode}
                    index={index}
                    isActive={activeTech === id}
                    onClick={() => setActiveTech(activeTech === id ? null : id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Elite Technologies Quantum Chamber */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center animate-pulse">
                  <FontAwesomeIcon icon={faStar} size="2x" className="text-white animate-spin" />
                </div>
                <h2 className="text-6xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  <FormattedMessage
                    id="technology-quantum-chamber-title"
                    description="Quantum chamber title"
                    defaultMessage="⚡ QUANTUM CORE"
                  />
                </h2>
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center animate-pulse">
                  <FontAwesomeIcon icon={faFire} size="2x" className="text-white animate-pulse" />
                </div>
              </div>
              <p className="text-xl text-orange-200">
                <FormattedMessage
                  id="technology-quantum-chamber-subtitle"
                  description="Quantum chamber subtitle"
                  defaultMessage="Elite-tier technologies transcending dimensional boundaries"
                />
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {leadingTechState?.map(({ id, tech_color: colorTechStack, name: techName }, index) => (
                <div 
                  key={id}
                  className="transform transition-all duration-500 hover:scale-105"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <QuantumEliteTechCard
                    techStackName={techName}
                    techStackColor={colorTechStack}
                    index={index}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Cosmic Statistics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { 
                value: leadingTechState?.length || 0, 
                label: 'Quantum Cores',
                icon: faAtom,
                color: 'from-purple-500 to-pink-500'
              },
              { 
                value: techStackState?.length || 0, 
                label: 'Tech Entities',
                icon: faCube,
                color: 'from-cyan-500 to-blue-500'
              },
              { 
                value: '∞', 
                label: 'Possibilities',
                icon: faInfinity,
                color: 'from-green-500 to-teal-500'
              },
              { 
                value: '100%', 
                label: 'Innovation',
                icon: faZap,
                color: 'from-yellow-500 to-orange-500'
              }
            ].map((stat, index) => (
              <div 
                key={index}
                className={`text-center p-8 rounded-3xl bg-gradient-to-br ${stat.color}/20 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105`}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <FontAwesomeIcon icon={stat.icon} size="2x" className="text-white" />
                </div>
                <h3 className="text-4xl font-black text-white mb-2">{stat.value}</h3>
                <p className="text-purple-200 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}

// Multidimensional Tech Card Component
function MultidimensionalTechCard({ techStackName, techStackColor, viewMode, index, isActive, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const getViewModeStyles = () => {
    switch (viewMode) {
      case 'galaxy':
        return 'h-40 rounded-3xl hover:scale-110 hover:rotate-6';
      case 'neural':
        return 'w-32 h-32 rounded-full hover:scale-125';
      case 'matrix':
        return 'h-48 rounded-2xl hover:skew-y-3 hover:scale-105';
      case 'hologram':
        return 'h-44 rounded-3xl hover:rotateY-12 hover:scale-110';
      default:
        return 'h-40 rounded-3xl hover:scale-110';
    }
  };

  const getGradient = () => {
    const gradients = [
      'from-purple-500 to-pink-600',
      'from-cyan-400 to-blue-600', 
      'from-green-400 to-teal-600',
      'from-yellow-400 to-orange-600',
      'from-red-400 to-pink-600',
      'from-indigo-500 to-purple-600'
    ];
    return gradients[index % gradients.length];
  };

  const getTechIcon = () => {
    const name = techStackName?.toLowerCase() || '';
    if (name.includes('ai') || name.includes('ml')) return faBrain;
    if (name.includes('react') || name.includes('next')) return faRocket;
    if (name.includes('quantum') || name.includes('blockchain')) return faGem;
    if (name.includes('cloud') || name.includes('aws')) return faAtom;
    if (name.includes('database') || name.includes('sql')) return faCube;
    return faCode;
  };

  return (
    <div
      className={`group relative ${getViewModeStyles()} cursor-pointer transform-gpu transition-all duration-700 overflow-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Dynamic Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${techStackColor || getGradient()}`}></div>
      
      {/* Neural Network Effect for neural view */}
      {viewMode === 'neural' && (
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-full bg-gradient-to-b from-transparent via-white/30 to-transparent"
              style={{
                left: `${20 + i * 10}%`,
                transform: `rotate(${i * 30}deg)`,
                transformOrigin: 'center'
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Matrix Code Effect for matrix view */}
      {viewMode === 'matrix' && isHovered && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute text-green-400 text-xs font-mono opacity-60 animate-pulse"
              style={{
                left: `${i * 20}%`,
                top: `${Math.random() * 80}%`,
                animationDelay: `${i * 200}ms`
              }}
            >
              {Math.random().toString(36).substr(2, 3)}
            </div>
          ))}
        </div>
      )}

      {/* Holographic Grid for hologram view */}
      {viewMode === 'hologram' && (
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        </div>
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-4 text-white">
        <div className={`mb-3 transition-all duration-500 ${isHovered ? 'scale-125 rotate-12' : ''}`}>
          <FontAwesomeIcon 
            icon={getTechIcon()} 
            className={`${viewMode === 'neural' ? 'text-2xl' : 'text-4xl'} drop-shadow-lg`}
          />
        </div>
        
        <h3 className={`font-bold text-white drop-shadow-lg text-center transition-all duration-300 ${
          viewMode === 'neural' ? 'text-xs' : 'text-base'
        } ${isHovered ? 'scale-110' : ''}`}>
          {techStackName}
        </h3>

        {/* Quantum Particles */}
        {isActive && (
          <>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/60 rounded-full animate-ping"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 200}ms`
                }}
              ></div>
            ))}
          </>
        )}

        {/* Energy Scan Line */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent transition-all duration-2000 ${
          isHovered ? 'translate-y-full' : '-translate-y-full'
        }`}></div>
      </div>
    </div>
  );
}

// Quantum Elite Tech Card Component
function QuantumEliteTechCard({ techStackName, techStackColor, index }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className="group relative h-56 rounded-3xl overflow-hidden cursor-pointer transform-gpu"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Quantum Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 via-red-500 to-pink-500"></div>
      
      {/* Elite Energy Field */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-yellow-300/30"></div>
      
      {/* Quantum Resonance */}
      <div className="absolute inset-0">
        <div className={`absolute inset-2 border-2 border-yellow-300/50 rounded-3xl ${isHovered ? 'animate-pulse' : ''}`}></div>
        <div className={`absolute inset-4 border border-white/30 rounded-3xl ${isHovered ? 'animate-ping' : ''}`}></div>
      </div>

      {/* Elite Badge */}
      <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-r from-yellow-300 to-yellow-100 rounded-full flex items-center justify-center shadow-lg">
        <FontAwesomeIcon icon={faStar} className="text-yellow-700 animate-spin" />
      </div>

      {/* Quantum Particles */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-yellow-300 rounded-full transition-all duration-1000 ${
              isHovered ? 'animate-bounce' : 'animate-pulse'
            }`}
            style={{
              left: `${10 + (i * 7)}%`,
              top: `${15 + (i * 6)}%`,
              animationDelay: `${i * 150}ms`
            }}
          ></div>
        ))}
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-6 text-white">
        <div className={`mb-4 transition-all duration-500 ${isHovered ? 'scale-150 rotate-45' : 'scale-125'}`}>
          <FontAwesomeIcon 
            icon={faFire} 
            className="text-6xl drop-shadow-2xl text-white"
          />
        </div>
        
        <h3 className="text-2xl font-black text-center text-white drop-shadow-lg mb-2">
          {techStackName}
        </h3>
        
        <div className="text-sm text-yellow-100 font-bold px-3 py-1 bg-black/30 rounded-full">
          <FormattedMessage
            id="technology-quantum-elite-badge"
            description="Quantum elite badge"
            defaultMessage="⚡ QUANTUM CORE"
          />
        </div>

        {/* Elite Shimmer */}
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-1500 ${
          isHovered ? 'translate-x-full' : '-translate-x-full'
        }`}></div>
      </div>
    </div>
  );
}
