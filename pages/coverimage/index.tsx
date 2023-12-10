import React from "react";
import Image from "next/legacy/image";
import mountains from "../../public/mountains.jpg";

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
    </>
  );
}

export default Pics;
