'use client';

import { faAngular, faBootstrap, faCss3Alt, faGit, faGithub, faHtml5, faJava, faJs, faNode, faNpm, faPython, faReact, faSass, faVuejs, faYarn } from "@fortawesome/free-brands-svg-icons";
 
import Image from 'next/image'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Python from "../public/technology/python_logo.svg"
import Svelte from "../public/technology/svelte_logo.svg";
import Nuxt from "../public/technology/nuxt_logo.svg";
import Vuejs from "../public/technology/vuejs_logo.svg";
import Azure from "../public/technology/azure_logo.svg";
import Kubernetes from "../public/technology/kubernetes_logo.svg";
import GCP from "../public/technology/google_cloud_logo.svg";
import firebase from "../public/technology/firebase_logo.svg";
import nextjs from "../public/technology/nextjs_logo.svg";
import Typscript from "../public/technology/typescript_logo.svg";
import Supabase from "../public/technology/supabase_logo.svg";
import ngRX from "../public/technology/ngrx_logo.svg";
import rxJS from "../public/technology/rxjs_logo.svg";
import prima from "../public/technology/prisma_logo.svg";
import tailwindcss from "../public/technology/tailwind-css_logo.svg";
import spring from "../public/technology/spring_logo.svg";
import aws from "../public/technology/amazon_web_services_logo.svg";
import apollo from "../public/technology/apollo_graphql_logo.svg";
import bunjs from "../public/technology/bunjs_logo.svg";
import denojs from "../public/technology/deno_logo.svg";
import chaijs from "../public/technology/chai_logo.svg";
import mochajs from "../public/technology/mocha_logo.svg";
import jasminejs from "../public/technology/jasmine_logo.svg";
import jestjs from "../public/technology/jest_logo.svg";
import karmajs from "../public/technology/karma_logo.svg";
import cypressjs from "../public/technology/cypress_logo.svg";
import flutter from "../public/technology/flutter_logo.svg";
import graphql from "../public/technology/graphql_logo.svg";
import litjs from "../public/technology/lit_logo.svg";
import mongodb from "../public/technology/mongodb_logo.svg";
import mysql from "../public/technology/mysql_logo.svg";
import postgresql from "../public/technology/postgresql_elephant_logo.svg";
import docker from "../public/technology/docker_logo.svg";
import openshift from "../public/technology/openshift.svg";
import preactjs from "../public/technology/preact_logo.svg";
import redux from "../public/technology/redux_logo.svg";
import rollup from "../public/technology/rollup_logo.svg";
import webpack from "../public/technology/webpack_logo.svg";
import vitejs from "../public/technology/vitejs_logo.svg";
import vuex from "../public/technology/vuex_logo.svg";
import webcomponent from "../public/technology/web_components_logo.svg";
import webstrom from "../public/technology/webstorm_logo.svg";

const HorizontalScrollTech = ({ reverse = false }) => {
  return (
    <div className={`px-5 dark:text-blog-white gap-8 flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none  ${reverse ? 'animate-infinite-scroll' : 'animate-infinite-reverse'}`}>
      <FontAwesomeIcon icon={faJava} size="8x" className={'text-[#5986a4]'} />
      <Image
        src={spring}
        width={80}
        height={80}
        alt="image of Spring logo"
      />

      <FontAwesomeIcon icon={faReact} size="8x" className={'text-[#149eca]'} />
      <Image
        src={preactjs}
        width={80}
        height={80}
        alt="image of Preact logo"
      />

      <Image
        src={rxJS}
        width={80}
        height={80}
        alt="image of rxJS logo"
      />

      <Image
        src={redux}
        width={80}
        height={80}
        alt="image of redux logo"
      />

      <Image
        src={Supabase}
        width={80}
        height={80}
        alt="image of Supabase logo"
      />

      <Image
        src={prima}
        width={80}
        height={80}
        alt="image of Prima logo"
      />

      <Image
        src={mongodb}
        width={80}
        height={80}
        alt="image of MongoDb logo"
      />

      <Image
        src={postgresql}
        width={80}
        height={80}
        alt="image of Postgres Sql logo"
      />

      <Image
        src={mysql}
        width={80}
        height={80}
        alt="image of My Sql logo"
      />

      <Image
        src={Typscript}
        width={80}
        height={80}
        alt="image of Typescript logo"
      />

      <Image
        src={nextjs}
        width={100}
        height={100}
        alt="image of NextJs logo"
      />

      <Image
        src={chaijs}
        width={80}
        height={80}
        alt="image of ChaiJS logo"
      />

      <Image
        src={mochajs}
        width={80}
        height={80}
        alt="image of MochaJS logo"
      />

      <Image  
        src={jasminejs}
        width={80}
        height={80}
        alt="image of Jasmine logo"
      />

      <Image  
        src={jestjs}
        width={80}
        height={80}
        alt="image of Jest logo"
      />

      <Image  
        src={karmajs}
        width={80}
        height={80}
        alt="image of Karma logo"
      />

      <Image  
        src={cypressjs}
        width={80}
        height={80}
        alt="image of Cypress logo"
      />

      <Image
        src={apollo}
        width={100}
        height={100}
        alt="image of Apollo logo"
      />

      <Image
        src={graphql}
        width={100}
        height={100}
        alt="image of GraphQL logo"
      />

      <Image
        src={flutter}
        width={100}
        height={100}
        alt="image of Flutter logo"
      />

      <Image
        src={Svelte}
        width={80}
        height={80}
        alt="image of Svelte logo"
      />

      <Image  
        src={litjs}
        width={80}
        height={80}
        alt="image of Lit logo"
      />

      <Image
        src={Python}
        width={80}
        height={80}
        alt="image of Python logo"
      />

      <FontAwesomeIcon icon={faAngular} size="8x" className={'text-[#c3012f]'} />

      <Image
        src={ngRX}
        width={80}
        height={80}
        alt="image of ngRX logo"
      />

      <FontAwesomeIcon icon={faNode} size="8x" className={'text-[#85cf36]'} />
      <Image
        src={bunjs}
        width={80}
        height={80}
        alt="image of bunjs logo"
      />
      <Image
        src={denojs}
        width={80}
        height={80}
        alt="image of bunjs logo"
      />

      {/* Vue JS Logo */}
      {/* <FontAwesomeIcon icon={faVuejs} size="8x" className={"text-[#347a59]"} />  */}
      <Image
        src={Vuejs}
        width={80}
        height={80}
        alt="image of VueJs logo"
      />

      <Image
        src={Nuxt}
        width={80}
        height={80}
        alt="image of NuxtJs logo"
      />

      <Image
        src={vuex}
        width={80}
        height={80}
        alt="image of VueX logo"
      />

      <Image
        src={webcomponent}
        width={80}
        height={80}
        alt="image of web component logo"
      />

      <FontAwesomeIcon icon={faJs} size="8x" className={'text-[#f4dd58]'} />
      <FontAwesomeIcon icon={faCss3Alt} size="8x" className={'text-[#2d53e5]'} />
      <FontAwesomeIcon icon={faHtml5} size="8x" className={'text-[#e5532f]'} />

      <Image
        src={tailwindcss}
        width={80}
        height={80}
        alt="image of tailwindcss logo"
      />

      <FontAwesomeIcon icon={faSass} size="8x" className={'text-[#cf6c9c]'} />
      <FontAwesomeIcon icon={faBootstrap} size="8x" className={'text-[#781bf8]'} /> 

      <Image
        src={rollup}
        width={80}
        height={80}
        alt="image of RollUp logo"
      />

      <Image
        src={webpack}
        width={80}
        height={80}
        alt="image of webpack logo"
      />

      <Image
        src={vitejs}
        width={80}
        height={80}
        alt="image of vitjs logo"
      />

      <Image
        src={Kubernetes}
        width={80}
        height={80}
        alt="image of Kubernetes logo"
      />

      <Image
        src={openshift}
        width={80}
        height={80}
        alt="image of OpenShift logo"
      />

      <Image
        src={docker}
        width={80}
        height={80}
        alt="image of Docker logo"
      />

      <Image
        src={Azure}
        width={80}
        height={80}
        alt="image of azure logo"
      />

      <Image
        src={aws}
        width={80}
        height={80}
        alt="image of amazon web services logo"
      />

      <Image
        src={GCP}
        width={80}
        height={80}
        alt="image of Google Cloud Platform logo"
      />

      <Image
        src={firebase}
        width={80}
        height={80}
        alt="image of Firebase logo"
      />

      <FontAwesomeIcon icon={faGithub} size="8x" className={'text-blog-black'}/>
      <FontAwesomeIcon icon={faYarn} size="8x" className={'text-[#3592bd]'} /> 
      <FontAwesomeIcon icon={faNpm} size="8x" className={'text-[#c3292f]'} />
      <FontAwesomeIcon icon={faGit} size="8x" className={'text-[#f1563b]'} />

      <Image
        src={webstrom}
        width={80}
        height={80}
        alt="image of webstrom logo"
      />

    </div>
  );
};

export default HorizontalScrollTech;