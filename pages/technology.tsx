import { useState } from "react";
import Metatags from "../components/Metatags";
import TechBox from "../components/TechBox";

const initialTechStackState = [
    {
        techName: "#JavaScript",
        colorTechStack: "text-blog-white dark:text-blog-white bg-persian-blue-500 hover:bg-persian-blue-600 " 
    },
    {
        techName: "#TypeScript",
        colorTechStack: "text-blog-white dark:text-blog-white bg-dark-blue-500 hover:bg-dark-blue-600" 
    },
    {
        techName: "#CSS",
        colorTechStack: "dark:text-blog-black bg-caribbean-green-500 hover:bg-caribbean-green-600" 
    },
    {
        techName: "#CSS4",
        colorTechStack: "" 
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
    }
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
        <Metatags description={`Technology stack that I am fluent in`}/>
        <div className="flex py-10 px-10 flex-wrap">
        {techStack && techStack.map(({techName, colorTechStack}) => <TechBox key={techName} techStackName={techName} techStackColor={colorTechStack}/>)}
        </div>
        <button onClick={() => techStackCheck()}>Tech Stack</button>
    </>
  );
}


