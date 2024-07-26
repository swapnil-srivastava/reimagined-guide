import React from "react";
import Image from "next/legacy/image";
import mountains from "../../public/mountains.jpg";
import { Button } from "@mui/material";
import { callNest } from "../../services/helloWorld.service";
import { callNestSendEmail } from "../../services/email.service";
import * as postmark from "postmark";

function Pics() {
  const emailMessage: Partial<postmark.Message> = {
    To: "contact@swapnilsrivastava.eu",
    Subject: "nest email",
    HtmlBody: `<strong>Hello</strong> Swapnil Srivastava, nest email check`,
  };

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
      <Button onClick={() => callNestSendEmail(emailMessage)}>Call send email from nest</Button>
    </>
  );
}

export default Pics;
