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

  useEffect(() => {
    // getTechStack();
    getTechStackFirebase();
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
  
  async function getTechStackFirebase() {

    try {
      // 👇️ const data: GetTechStackResponse
      const q = query(collection(firestore, "technologies"));

      const querySnapshot = await getDocs(q);

      let tempDoc: TechStack[] = []

      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        tempDoc = [...tempDoc, 
          {
            techName: doc.data().name,
            colorTechStack: doc.data().techColor
          }];
      });

      console.log("tempDoc", tempDoc);
      setTechStackState(tempDoc);
      return tempDoc;
    } catch (error) {
      console.log('unexpected error: ', error);
      return 'An unexpected error occurred';
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


