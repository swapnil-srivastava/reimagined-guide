import { useEffect, useState } from "react";
import Metatags from "../components/Metatags";
import TechBox from "../components/TechBox";
import * as axios from "axios";

type TechStack = {
    techName: number;
    colorTechStack: string;
};

type TechStackArray = { 
    techStack : TechStack[] 
}

type GetTechStackResponse = {
    data: TechStackArray[];
};
  
export default function Technology() {
  const [techStack, setTechStack] = useState<TechStack[]>();

  useEffect(() => {
    getTechStack();
  },[])

  async function getTechStack() {

    try {
      // 👇️ const data: GetTechStackResponse
      const { data, status } = await axios.get<GetTechStackResponse>(
        '/api/techstack',
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );
  
      setTechStack(data.techStack);
  
      return data;

    } catch (error) {
      if (new axios.AxiosError(error)) {
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
            {techStack && techStack.map(({techName, colorTechStack}) => <TechBox key={techName} techStackName={techName} techStackColor={colorTechStack}/>)}
        </div>
    </>
  );
}


