import { useEffect, useState } from "react";
import Metatags from "../components/Metatags";
import TechBox from "../components/TechBox";
import axios from "axios";

type TechStack = {
    techName: number;
    colorTechStack: string;
};

type TechStackResponse = { 
    techStack : TechStack[]; 
}
  
export default function Technology() {
  const [techStackState, setTechStackState] = useState<TechStack[]>();

  useEffect(() => {
    getTechStack();
  },[])

  async function getTechStack() {

    try {
      // 👇️ const data: GetTechStackResponse
      const { data, status } = await axios.get<TechStackResponse>(
        '/api/techstack',
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      const { techStack } = data;
  
      setTechStackState(techStack);
  
      return data;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('error message: ', error.message);
        return error.message;
      } else {
        console.log('unexpected error: ', error);
        return 'An unexpected error occurred';
      }
    }
  }
  

  return (
    <>
        <Metatags description={`Technology stack that I am fluent in`}/>
        <div className="flex py-10 px-10 flex-wrap">
            {techStackState && techStackState.map(({techName, colorTechStack}) => <TechBox key={techName} techStackName={techName} techStackColor={colorTechStack}/>)}
        </div>
    </>
  );
}


