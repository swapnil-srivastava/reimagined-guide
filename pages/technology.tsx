import { useState } from "react";
import TechBox from "../components/TechBox";

const initialTechStackState = [
    {
        techName: "#JavaScript",
    },
    {
        techName: "#TypeScript",
    },
    {
        techName: "#CSS",
    },
    {
        techName: "#CSS4",
    },
    {
        techName: "#HTML",
    },
    {
        techName: "#HTML5",
    },
    {
        techName: "#ES6/7",
    },
    {
        techName: "#Redux",
    },
    {
        techName: "#ngRX",
    },
    {
        techName: "#Angular",
    },
]

export default function Technology() {
  const [techStack, setTechStack] = useState(initialTechStackState);

  function techStackCheck(): void {
    console.log('================techStack====================');
    console.log(techStack);
    console.log('=================techStack===================');
  }

  return (
    <>
        <div className="flex py-10 px-10 flex-wrap">
        {techStack && techStack.map(({techName}) => <TechBox key={techName} techStackName={techName} />)}
        </div>
        <button onClick={() => techStackCheck()}>Tech Stack</button>
    </>
  );
}


