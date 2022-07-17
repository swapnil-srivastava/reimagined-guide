import { useEffect, useState } from "react";
import Metatags from "../components/Metatags";
import TechBox from "../components/TechBox";
import axios from "axios";
import { collection, query, getDocs } from "firebase/firestore";
import { firestore } from "../lib/firebase";

type TechStack = {
    techName: number;
    colorTechStack: string;
};

type TechStackResponse = { 
    techStack : TechStack[]; 
}
  
export default function Technology() {
  const [techStackState, setTechStackState] = useState<TechStack[]>();
  const [bleedingTechState, setBleedingTechState] = useState<TechStack[]>();

  useEffect(() => {
    // getTechStack();
    getTechStackFirebase();
    getBleedingTechFirebase();
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


  
  async function getBleedingTechFirebase() {

    try {
      // 👇️ const data: GetTechStackResponse
      const q = query(collection(firestore, "technologies"));

      const querySnapshot = await getDocs(q);

      let tempDoc: TechStack[] = []

      querySnapshot.forEach((doc) => {
        tempDoc = [...tempDoc, 
          {
            techName: doc.data().name,
            colorTechStack: doc.data().techColor
          }];
      });

      setTechStackState(tempDoc);
      return tempDoc;
    } catch (error) {
      console.log('unexpected error: ', error);
      return 'An unexpected error occurred';
    }
  }

  async function getTechStackFirebase() {

    try {
      // 👇️ const data: GetTechStackResponse
      const q = query(collection(firestore, "leadingtech"));
      const querySnapshot = await getDocs(q);

      let tempDoc: TechStack[] = []

      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        tempDoc = [...tempDoc, 
          {
            techName: doc.data().name,
            colorTechStack: doc.data().techColor
          }];
      });

      setBleedingTechState(tempDoc);
      return tempDoc;
    } catch (error) {
      console.log('unexpected error: ', error);
      return 'An unexpected error occurred';
    }
  }

  return (
    <>
        <Metatags description={`Technology stack that I am fluent in`}/>
        <div className="px-10 pb-2 text-2xl font-extralight dark:text-blog-white">Tech Stack</div>

        <div className="flex py-10 px-10 pt-2 flex-wrap">
            {techStackState && techStackState.map(({techName, colorTechStack}) => <TechBox key={techName} techStackName={techName} techStackColor={colorTechStack}/>)}
        </div>

        <div className="px-10 pb-0 text-2xl font-extralight dark:text-blog-white">Bleeding Tech</div>
        <div className="flex py-10 px-10 pt-2 flex-wrap">
            {bleedingTechState && bleedingTechState.map(({techName, colorTechStack}) => <TechBox key={techName} techStackName={techName} techStackColor={colorTechStack}/>)}
        </div>
        
    </>
  );
}


