'use client';

import { faAngular, faBootstrap, faCss3Alt, faGit, faGithub, faHtml5, faJava, faJs, faNode, faNpm, faPython, faReact, faSass, faVuejs, faYarn } from "@fortawesome/free-brands-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const HorizontalScrollTech = ({ reverse = false }) => {
  return (
    <div className={`px-5 flex dark:text-blog-white flex-row justify-start items-center gap-8 ${reverse ? 'animate-infinite-scroll' : 'animate-infinite-reverse'}`}>
      <FontAwesomeIcon icon={faJava} size="8x" className={'text-[#5986a4]'}/>
      <FontAwesomeIcon icon={faReact} size="8x" className={'text-[#149eca]'}/>
      <FontAwesomeIcon icon={faPython} size="8x" className={'text-[#427aa9]'}/>
      <FontAwesomeIcon icon={faAngular} size="8x" className={'text-[#c3012f]'}/>
      <FontAwesomeIcon icon={faNode} size="8x" className={'text-[#85cf36]'}/>
      <FontAwesomeIcon icon={faVuejs} size="8x" className={"text-[#347a59]"} /> 
      <FontAwesomeIcon icon={faJs} size="8x" className={'text-[#f4dd58]'}/>
      <FontAwesomeIcon icon={faCss3Alt} size="8x" className={'text-[#2d53e5]'}/>
      <FontAwesomeIcon icon={faSass} size="8x" className={'text-[#cf6c9c]'}/>
      <FontAwesomeIcon icon={faHtml5} size="8x" className={'text-[#e5532f]'}/>
      <FontAwesomeIcon icon={faBootstrap} size="8x" className={'text-[#781bf8]'}/> 
      <FontAwesomeIcon icon={faGithub} size="8x" />
      <FontAwesomeIcon icon={faYarn} size="8x" className={'text-[#3592bd]'}/> 
      <FontAwesomeIcon icon={faNpm} size="8x" className={'text-[#c3292f]'}/>
      <FontAwesomeIcon icon={faGit} size="8x" className={'text-[#f1563b]'}/>
    </div>
  );
};

export default HorizontalScrollTech;