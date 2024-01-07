'use client';

import { faAngular, faBootstrap, faCss3Alt, faGit, faGithub, faHtml5, faJava, faJs, faNode, faNpm, faPython, faReact, faSass, faVuejs, faYarn } from "@fortawesome/free-brands-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const HorizontalScrollTech = ({ reverse = false }) => {
  return (
    <div className={`px-5 flex dark:text-blog-white flex-row justify-start items-center gap-8 ${reverse ? 'animate-infinite-scroll' : 'animate-infinite-reverse'}`}>
      <FontAwesomeIcon icon={faJava} size="8x" />
      <FontAwesomeIcon icon={faReact} size="8x"/>
      <FontAwesomeIcon icon={faPython} size="8x" />
      <FontAwesomeIcon icon={faAngular} size="8x" />
      <FontAwesomeIcon icon={faNode} size="8x" />
      <FontAwesomeIcon icon={faVuejs} size="8x" /> 
      <FontAwesomeIcon icon={faJs} size="8x"/>
      <FontAwesomeIcon icon={faCss3Alt} size="8x"/>
      <FontAwesomeIcon icon={faSass} size="8x" />
      <FontAwesomeIcon icon={faHtml5} size="8x" />
      <FontAwesomeIcon icon={faBootstrap} size="8x" /> 
      <FontAwesomeIcon icon={faGithub} size="8x" />
      <FontAwesomeIcon icon={faYarn} size="8x" /> 
      <FontAwesomeIcon icon={faNpm} size="8x" />
      <FontAwesomeIcon icon={faGit} size="8x" />
    </div>
  );
};

export default HorizontalScrollTech;