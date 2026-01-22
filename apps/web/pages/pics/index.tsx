import React from "react";
import Image from "next/legacy/image";
import mountains from "../../public/mountains.jpg";

function Pics() {
  return (
    <main className="text-blog-black dark:text-blog-white">
      <div className="flex flex-wrap bg-blog-white card--white">
        <Image
          alt="Mountains"
          src={mountains}
          placeholder="blur"
          quality={100}
        />
      </div>
    </main>
  );
}

export default Pics;
