import React from "react";
import Image from "next/image";
import mountains from "../../public/mountains.jpg";

function Pics() {
  return (
    <>
      <div className="flex flex-wrap">
        <Image
          alt="Mountains"
          src={mountains}
          placeholder="blur"
          quality={100}
        />
      </div>
    </>
  );
}

export default Pics;
