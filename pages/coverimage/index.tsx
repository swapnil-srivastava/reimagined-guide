import React from "react";
import Image from "next/legacy/image";
import mountains from "../../public/mountains.jpg";
import { Button } from "@mui/material";
import { callNest } from "../../services/helloWorld.service";


function Pics() {
  return (
    <>
      <Image
        alt="Mountains"
        src={mountains}
        placeholder="blur"
        quality={100}
        sizes="100vw"
        style={{
          objectFit: "cover",
        }}
      />
      <Button onClick={() => callNest()}>call nest</Button>
    </>
  );
}

export default Pics;
